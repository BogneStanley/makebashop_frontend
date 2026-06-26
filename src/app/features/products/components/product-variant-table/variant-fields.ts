import { ProductVariantRequest } from '../../../../core/models/products/product-request.models';

export type VariantRow = ProductVariantRequest & { id?: number };

export type VariantField = keyof Pick<
  VariantRow,
  'sku' | 'price' | 'stockQuantity' | 'size' | 'color'
>;

export const VARIANT_FIELDS: { key: VariantField; label: string }[] = [
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Prix (FCFA)' },
  { key: 'stockQuantity', label: 'Stock' },
  { key: 'size', label: 'Taille' },
  { key: 'color', label: 'Couleur' },
];

export const DEFAULT_VARIANT_COLOR = '#000000';

export function isColorField(field: VariantField): boolean {
  return field === 'color';
}

export function normalizeHexColor(value: string | number | null | undefined): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
    return raw.toUpperCase();
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(raw)) {
    const [r, g, b] = raw.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) {
    return `#${raw}`.toUpperCase();
  }
  return null;
}

export function isVariantValid(variant: VariantRow): boolean {
  return !!(
    variant.sku.trim() &&
    variant.size.trim() &&
    normalizeHexColor(variant.color) &&
    variant.price >= 0 &&
    variant.stockQuantity >= 0
  );
}

export function emptyVariant(): VariantRow {
  return { sku: '', price: 0, stockQuantity: 0, size: '', color: DEFAULT_VARIANT_COLOR };
}

export function emptyFieldValues(): Record<VariantField, string | number> {
  return { sku: '', price: 0, stockQuantity: 0, size: '', color: DEFAULT_VARIANT_COLOR };
}

export function mergeVariant(
  groupValues: Partial<Record<VariantField, string | number>>,
  rowValues: Partial<Record<VariantField, string | number>>,
): VariantRow {
  const merged = { ...emptyVariant(), ...groupValues, ...rowValues };
  return {
    sku: String(merged.sku).trim(),
    price: Number(merged.price) || 0,
    stockQuantity: Number(merged.stockQuantity) || 0,
    size: String(merged.size).trim(),
    color: normalizeHexColor(merged.color) ?? '',
  };
}

export function isNumericField(field: VariantField): boolean {
  return field === 'price' || field === 'stockQuantity';
}
