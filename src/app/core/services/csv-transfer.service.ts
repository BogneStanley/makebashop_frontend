import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductResponse } from '../models/products/product-response.models';
import { ProductVariantRequest } from '../models/products/product-request.models';
import { ProductHighlightType } from '../models/settings/product-highlight.models';
import { CategoryService } from './category.service';
import { ContactSettingsService } from './contact-settings.service';
import { ManagedProductService } from './managed-product.service';
import { ProductHighlightService } from './product-highlight.service';

export type CsvTransferKind = 'products' | 'categories' | 'settings';

export interface CsvTransferResult {
  imported: number;
  skipped: number;
  errors: string[];
}

type CsvRow = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class CsvTransferService {
  private platformId = inject(PLATFORM_ID);
  private categoryService = inject(CategoryService);
  private managedProductService = inject(ManagedProductService);
  private contactSettingsService = inject(ContactSettingsService);
  private productHighlightService = inject(ProductHighlightService);

  async export(kind: CsvTransferKind): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const csv = await this.buildExport(kind);
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `makeba-${kind}-${this.dateStamp()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async import(kind: CsvTransferKind, file: File): Promise<CsvTransferResult> {
    const rows = this.parse(await file.text());
    if (!rows.length) {
      return {
        imported: 0,
        skipped: 0,
        errors: ['Le fichier ne contient aucune ligne de données.'],
      };
    }

    switch (kind) {
      case 'categories':
        return this.importCategories(rows);
      case 'products':
        return this.importProducts(rows);
      case 'settings':
        return this.importSettings(rows);
    }
  }

  private async buildExport(kind: CsvTransferKind): Promise<string> {
    switch (kind) {
      case 'categories':
        return this.toCsv(
          ['name', 'description'],
          (await firstValueFrom(this.categoryService.loadCategories())).map((category) => [
            category.name,
            category.description ?? '',
          ]),
        );
      case 'products':
        return this.exportProducts();
      case 'settings':
        return this.exportSettings();
    }
  }

  private async exportProducts(): Promise<string> {
    const products = await this.getAllProducts();
    const rows: string[][] = [];

    for (const product of products) {
      for (const variant of product.productVariants) {
        rows.push([
          product.name,
          product.description,
          product.details ?? '',
          product.shippingInfo ?? '',
          String(product.isActive),
          product.categories.map((category) => category.name).join('|'),
          variant.sku,
          String(variant.price.amount),
          String(variant.stockQuantity),
          variant.size,
          variant.color,
        ]);
      }
    }

    return this.toCsv(
      [
        'name',
        'description',
        'details',
        'shipping_info',
        'is_active',
        'categories',
        'sku',
        'price',
        'stock_quantity',
        'size',
        'color',
      ],
      rows,
    );
  }

  private async exportSettings(): Promise<string> {
    const [contacts, highlights] = await Promise.all([
      firstValueFrom(this.contactSettingsService.getAdminContacts()),
      firstValueFrom(this.productHighlightService.getConfig()),
    ]);
    const rows: string[][] = [];

    for (const [key, value] of Object.entries(contacts?.contacts ?? {})) {
      rows.push(['contact', key, value]);
    }

    const highlightFields: Array<
      [ProductHighlightType, 'newProducts' | 'popularProducts' | 'featuredProducts']
    > = [
      ['NEW', 'newProducts'],
      ['POPULAR', 'popularProducts'],
      ['FEATURED', 'featuredProducts'],
    ];
    for (const [type, field] of highlightFields) {
      const list = highlights?.[field];
      if (list?.configured) {
        rows.push(['highlight', type, list.products.map((product) => product.name).join('|')]);
      }
    }

    return this.toCsv(['section', 'key', 'value'], rows);
  }

  private async importCategories(rows: CsvRow[]): Promise<CsvTransferResult> {
    const result = this.emptyResult();
    const existing = await firstValueFrom(this.categoryService.loadCategories());
    const byName = new Map(existing.map((category) => [this.normalise(category.name), category]));

    for (const [index, row] of rows.entries()) {
      const name = row['name']?.trim();
      if (!name) {
        result.skipped++;
        result.errors.push(`Ligne ${index + 2} : le nom de la catégorie est requis.`);
        continue;
      }
      const input = { name, description: row['description']?.trim() || undefined };
      const current = byName.get(this.normalise(name));
      const saved = current
        ? await firstValueFrom(this.categoryService.updateCategory(current.id, input))
        : await firstValueFrom(this.categoryService.createCategory(input));
      if (!saved) {
        result.skipped++;
        result.errors.push(`Ligne ${index + 2} : impossible d’enregistrer « ${name} ».`);
        continue;
      }
      byName.set(this.normalise(saved.name), saved);
      result.imported++;
    }
    return result;
  }

  private async importProducts(rows: CsvRow[]): Promise<CsvTransferResult> {
    const result = this.emptyResult();
    const [categories, existing] = await Promise.all([
      firstValueFrom(this.categoryService.loadCategories()),
      this.getAllProducts(),
    ]);
    const categoriesByName = new Map(
      categories.map((category) => [this.normalise(category.name), category]),
    );
    const productsByName = new Map(
      existing.map((product) => [this.normalise(product.name), product]),
    );
    const grouped = new Map<string, CsvRow[]>();

    for (const row of rows) {
      const name = row['name']?.trim();
      if (!name) {
        result.skipped++;
        result.errors.push('Une ligne produit a été ignorée car son nom est vide.');
        continue;
      }
      const key = this.normalise(name);
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }

    for (const productRows of grouped.values()) {
      const first = productRows[0];
      const name = first['name'].trim();
      const categoryNames = this.listValue(first['categories']);
      const unknownCategories = categoryNames.filter(
        (category) => !categoriesByName.has(this.normalise(category)),
      );
      if (unknownCategories.length) {
        result.skipped++;
        result.errors.push(`« ${name} » : catégories inconnues : ${unknownCategories.join(', ')}.`);
        continue;
      }

      const variants = this.parseVariants(productRows, name, result);
      if (!variants.length) {
        result.skipped++;
        continue;
      }
      const categoryIds = categoryNames.map(
        (category) => categoriesByName.get(this.normalise(category))!.id,
      );
      const current = productsByName.get(this.normalise(name));
      const request = {
        name,
        description: first['description']?.trim() ?? '',
        details: first['details']?.trim() || undefined,
        shippingInfo: first['shipping_info']?.trim() || undefined,
        categoryIds,
      };

      let saved: ProductResponse | null;
      if (current) {
        saved = await firstValueFrom(
          this.managedProductService.updateProduct(current.id, {
            ...request,
            isActive: this.booleanValue(first['is_active'], current.isActive),
          }),
        );
        if (saved) {
          const variantsBySku = new Map(
            current.productVariants.map((variant) => [variant.sku, variant]),
          );
          const newVariants = variants.filter((variant) => !variantsBySku.has(variant.sku));
          for (const variant of variants.filter((item) => variantsBySku.has(item.sku))) {
            saved = await firstValueFrom(
              this.managedProductService.updateVariant(
                current.id,
                variantsBySku.get(variant.sku)!.id,
                variant,
              ),
            );
            if (!saved) break;
          }
          if (saved && newVariants.length) {
            saved = await firstValueFrom(
              this.managedProductService.addVariants(current.id, newVariants),
            );
          }
        }
      } else {
        saved = await firstValueFrom(
          this.managedProductService.createProduct({ ...request, productVariants: variants }),
        );
        if (saved && !this.booleanValue(first['is_active'], true)) {
          saved = await firstValueFrom(this.managedProductService.deactivateProduct(saved.id));
        }
      }

      if (!saved) {
        result.skipped++;
        result.errors.push(`« ${name} » : import impossible.`);
        continue;
      }
      productsByName.set(this.normalise(saved.name), saved);
      result.imported++;
    }
    return result;
  }

  private async importSettings(rows: CsvRow[]): Promise<CsvTransferResult> {
    const result = this.emptyResult();
    const contacts: Record<string, string> = {};
    const highlights = new Map<ProductHighlightType, string[]>();
    const products = await this.getAllProducts();
    const productsByName = new Map(
      products.map((product) => [this.normalise(product.name), product]),
    );

    for (const [index, row] of rows.entries()) {
      const section = this.normalise(row['section']);
      const key = row['key']?.trim();
      if (!section || !key) {
        result.skipped++;
        result.errors.push(`Ligne ${index + 2} : section et clé sont requises.`);
      } else if (section === 'contact') {
        contacts[key] = row['value'] ?? '';
      } else if (section === 'highlight' && this.isHighlightType(key)) {
        highlights.set(key, this.listValue(row['value']));
      } else {
        result.skipped++;
        result.errors.push(`Ligne ${index + 2} : section ou clé inconnue.`);
      }
    }

    if (Object.keys(contacts).length) {
      const saved = await firstValueFrom(this.contactSettingsService.updateContacts(contacts));
      if (saved) result.imported++;
      else result.errors.push('Les contacts n’ont pas pu être enregistrés.');
    }
    for (const [type, names] of highlights) {
      const missing = names.filter((name) => !productsByName.has(this.normalise(name)));
      if (missing.length) {
        result.skipped++;
        result.errors.push(`Mise en avant ${type} : produits inconnus : ${missing.join(', ')}.`);
        continue;
      }
      const saved = await firstValueFrom(
        this.productHighlightService.setHighlights(
          type,
          names.map((name) => productsByName.get(this.normalise(name))!.id),
        ),
      );
      if (saved) result.imported++;
      else result.errors.push(`La mise en avant ${type} n’a pas pu être enregistrée.`);
    }
    return result;
  }

  private parseVariants(
    rows: CsvRow[],
    productName: string,
    result: CsvTransferResult,
  ): ProductVariantRequest[] {
    const variants: ProductVariantRequest[] = [];
    for (const row of rows) {
      const sku = row['sku']?.trim();
      const price = Number(row['price']);
      const stockQuantity = Number(row['stock_quantity']);
      if (
        !sku ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stockQuantity) ||
        stockQuantity < 0
      ) {
        result.errors.push(
          `« ${productName} » : une variante a des valeurs invalides (SKU, prix ou stock).`,
        );
        continue;
      }
      variants.push({
        sku,
        price,
        stockQuantity,
        size: row['size']?.trim() ?? '',
        color: row['color']?.trim() ?? '',
      });
    }
    return variants;
  }

  private async getAllProducts(): Promise<ProductResponse[]> {
    const products: ProductResponse[] = [];
    let page = 0;
    do {
      const response = await firstValueFrom(
        this.managedProductService.listManaged({ page, size: 100 }),
      );
      if (!response) break;
      products.push(...response.content);
      if (products.length >= response.totalElements) break;
      page++;
    } while (true);
    return products;
  }

  private parse(input: string): CsvRow[] {
    const text = input.replace(/^\uFEFF/, '');
    const delimiter = this.detectDelimiter(text);
    const values: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (char === '"') {
        if (quoted && text[index + 1] === '"') {
          cell += '"';
          index++;
        } else quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[index + 1] === '\n') index++;
        row.push(cell);
        cell = '';
        if (row.some((value) => value !== '')) values.push(row);
        row = [];
      } else cell += char;
    }
    row.push(cell);
    if (row.some((value) => value !== '')) values.push(row);
    const [headers, ...data] = values;
    if (!headers) return [];
    return data.map((cells) =>
      Object.fromEntries(
        headers.map((header, index) => [this.normalise(header), cells[index] ?? '']),
      ),
    );
  }

  private detectDelimiter(text: string): string {
    const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
    return (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  }

  private toCsv(headers: string[], rows: string[][]): string {
    return [headers, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
  }

  private listValue(value: string | undefined): string[] {
    return (value ?? '')
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  private normalise(value: string | undefined): string {
    return (value ?? '').trim().toLocaleLowerCase();
  }
  private booleanValue(value: string | undefined, fallback: boolean): boolean {
    return value?.trim() ? ['true', '1', 'oui', 'yes'].includes(this.normalise(value)) : fallback;
  }
  private isHighlightType(value: string): value is ProductHighlightType {
    return value === 'NEW' || value === 'POPULAR' || value === 'FEATURED';
  }
  private emptyResult(): CsvTransferResult {
    return { imported: 0, skipped: 0, errors: [] };
  }
  private dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
