import { ProductVariantResponse } from './product-response.models';

export interface ShopProductVariant {
  id: number;
  sku: string;
  price: number;
  stockQuantity: number;
  color: string;
  size: string;
}

export function toShopProductVariant(variant: ProductVariantResponse): ShopProductVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price.amount,
    stockQuantity: variant.stockQuantity,
    color: variant.color,
    size: variant.size,
  };
}

export function sortVariantsByPrice(
  variants: ProductVariantResponse[],
): ProductVariantResponse[] {
  return [...variants].sort((a, b) => a.price.amount - b.price.amount);
}

export function toSortedShopVariants(
  variants: ProductVariantResponse[],
): ShopProductVariant[] {
  return sortVariantsByPrice(variants).map(toShopProductVariant);
}

export function hasVariablePrices(variants: ShopProductVariant[]): boolean {
  if (variants.length <= 1) {
    return false;
  }

  const minPrice = variants[0].price;
  return variants.some((variant) => variant.price !== minPrice);
}

export function getUniqueColors(variants: ShopProductVariant[]): string[] {
  const seen = new Set<string>();
  const colors: string[] = [];

  for (const variant of variants) {
    if (variant.color && !seen.has(variant.color)) {
      seen.add(variant.color);
      colors.push(variant.color);
    }
  }

  return colors;
}

export function getAllSizes(variants: ShopProductVariant[]): string[] {
  const seen = new Set<string>();
  const sizes: string[] = [];

  for (const variant of variants) {
    if (variant.size && !seen.has(variant.size)) {
      seen.add(variant.size);
      sizes.push(variant.size);
    }
  }

  return sizes;
}

export function getSizesForColor(
  variants: ShopProductVariant[],
  color: string,
): string[] {
  const seen = new Set<string>();
  const sizes: string[] = [];

  for (const variant of variants) {
    if (variant.color === color && variant.size && !seen.has(variant.size)) {
      seen.add(variant.size);
      sizes.push(variant.size);
    }
  }

  return sizes;
}

export function findShopVariant(
  variants: ShopProductVariant[],
  color: string,
  size: string,
): ShopProductVariant | undefined {
  return variants.find((variant) => variant.color === color && variant.size === size);
}

export function getCheapestVariant(
  variants: ShopProductVariant[],
): ShopProductVariant | undefined {
  return variants[0];
}
