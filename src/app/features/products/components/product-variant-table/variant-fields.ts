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

export function isVariantValid(variant: VariantRow): boolean {
  return !!(
    variant.sku.trim() &&
    variant.size.trim() &&
    variant.color.trim() &&
    variant.price >= 0 &&
    variant.stockQuantity >= 0
  );
}

export function emptyVariant(): VariantRow {
  return { sku: '', price: 0, stockQuantity: 0, size: '', color: '' };
}

export function emptyFieldValues(): Record<VariantField, string | number> {
  return { sku: '', price: 0, stockQuantity: 0, size: '', color: '' };
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
    color: String(merged.color).trim(),
  };
}

export function isNumericField(field: VariantField): boolean {
  return field === 'price' || field === 'stockQuantity';
}
