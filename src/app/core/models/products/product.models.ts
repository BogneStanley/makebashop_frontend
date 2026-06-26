import { PaginationParams } from '../common/pagination.models';
import {
  ProductImageResponse,
  ProductResponse,
} from './product-response.models';

export interface ManagedProductFilters extends PaginationParams {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  categoryIds?: number[];
}

export interface ProductListItemView extends ProductResponse {
  totalStock: number;
  primaryImageUrl: string | null;
}

export function getPrimaryImage(
  product: ProductResponse,
): ProductImageResponse | null {
  const primary = product.images.find((image) => image.isPrimary);
  if (primary) {
    return primary;
  }

  if (product.images.length === 0) {
    return null;
  }

  return product.images.reduce((current, candidate) =>
    candidate.position < current.position ? candidate : current,
  );
}

export function getTotalStock(product: ProductResponse): number {
  return product.productVariants.reduce(
    (total, variant) => total + variant.stockQuantity,
    0,
  );
}

export function toProductListItemView(
  product: ProductResponse,
): ProductListItemView {
  const primaryImage = getPrimaryImage(product);

  return {
    ...product,
    totalStock: getTotalStock(product),
    primaryImageUrl: primaryImage?.url ?? null,
  };
}

export function toActiveFilterValue(
  filter: 'all' | 'active' | 'inactive',
): boolean | undefined {
  switch (filter) {
    case 'active':
      return true;
    case 'inactive':
      return false;
    case 'all':
      return undefined;
  }
}
