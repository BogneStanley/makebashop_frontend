import { ParamMap } from '@angular/router';
import { CatalogProductFilters } from '../models/products/product.models';

export const CATALOG_DEFAULT_MAX_PRICE = 100_000;
export const CATALOG_PAGE_SIZE = 48;

export interface CatalogSearchState {
  q: string;
  categoryIds: number[];
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  sort: string;
}

export const CATALOG_DEFAULT_STATE: CatalogSearchState = {
  q: '',
  categoryIds: [],
  minPrice: 0,
  maxPrice: CATALOG_DEFAULT_MAX_PRICE,
  inStock: false,
  sort: 'default',
};

export function parseCatalogSearchParams(params: ParamMap): CatalogSearchState {
  const categoryIds = [
    ...params.getAll('categoryIds'),
    ...(params.get('categoryIds')?.split(',') ?? []),
  ]
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  const minPrice = params.has('minPrice') ? Number(params.get('minPrice')) : 0;
  const maxPrice = params.has('maxPrice')
    ? Number(params.get('maxPrice'))
    : CATALOG_DEFAULT_MAX_PRICE;

  return {
    q: params.get('q') ?? '',
    categoryIds: [...new Set(categoryIds)],
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : CATALOG_DEFAULT_MAX_PRICE,
    inStock: params.get('inStock') === 'true',
    sort: params.get('sort') ?? 'default',
  };
}

export function toCatalogQueryParams(
  state: CatalogSearchState,
): Record<string, string | number | boolean | string[]> {
  const params: Record<string, string | number | boolean | string[]> = {};

  if (state.q.trim()) {
    params['q'] = state.q.trim();
  }
  if (state.categoryIds.length) {
    params['categoryIds'] = state.categoryIds.map(String);
  }
  if (state.minPrice > 0) {
    params['minPrice'] = state.minPrice;
  }
  if (state.maxPrice < CATALOG_DEFAULT_MAX_PRICE) {
    params['maxPrice'] = state.maxPrice;
  }
  if (state.inStock) {
    params['inStock'] = 'true';
  }
  if (state.sort !== 'default') {
    params['sort'] = state.sort;
  }

  return params;
}

export function sameCatalogSearchState(
  left: CatalogSearchState,
  right: CatalogSearchState,
): boolean {
  return (
    left.q === right.q &&
    left.minPrice === right.minPrice &&
    left.maxPrice === right.maxPrice &&
    left.inStock === right.inStock &&
    left.sort === right.sort &&
    left.categoryIds.length === right.categoryIds.length &&
    left.categoryIds.every((id, index) => id === right.categoryIds[index])
  );
}

export function toCatalogApiFilters(state: CatalogSearchState): CatalogProductFilters {
  const { sortBy, sortOrder } = mapSort(state.sort);
  const filters: CatalogProductFilters = {
    page: 0,
    size: CATALOG_PAGE_SIZE,
    sortBy,
    sortOrder,
  };

  const name = state.q.trim();
  if (name) {
    filters.name = name;
  }
  if (state.minPrice > 0) {
    filters.minPrice = state.minPrice;
  }
  if (state.maxPrice < CATALOG_DEFAULT_MAX_PRICE) {
    filters.maxPrice = state.maxPrice;
  }
  if (state.inStock) {
    filters.inStock = true;
  }
  if (state.categoryIds.length) {
    filters.categoryIds = state.categoryIds;
  }

  return filters;
}

function mapSort(sort: string): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  switch (sort) {
    case 'price-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'name-desc':
      return { sortBy: 'name', sortOrder: 'desc' };
    case 'name-asc':
      return { sortBy: 'name', sortOrder: 'asc' };
    default:
      return { sortBy: 'name', sortOrder: 'asc' };
  }
}
