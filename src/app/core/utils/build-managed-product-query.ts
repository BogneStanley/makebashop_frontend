import { HttpParams } from '@angular/common/http';
import { ManagedProductFilters } from '../models/products/product.models';

export function hasManagedSearchFilters(filters: ManagedProductFilters): boolean {
  return !!(
    filters.name?.trim() ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.inStock != null ||
    filters.isActive != null ||
    filters.categoryIds?.length
  );
}

export function buildManagedProductParams(filters: ManagedProductFilters): HttpParams {
  let params = new HttpParams()
    .set('page', String(filters.page ?? 0))
    .set('size', String(filters.size ?? 10))
    .set('sortBy', filters.sortBy ?? 'name')
    .set('sortOrder', filters.sortOrder ?? 'asc');

  const name = filters.name?.trim();
  if (name) {
    params = params.set('name', name);
  }
  if (filters.minPrice != null) {
    params = params.set('minPrice', String(filters.minPrice));
  }
  if (filters.maxPrice != null) {
    params = params.set('maxPrice', String(filters.maxPrice));
  }
  if (filters.inStock != null) {
    params = params.set('inStock', String(filters.inStock));
  }
  if (filters.isActive != null) {
    params = params.set('isActive', String(filters.isActive));
  }
  if (filters.categoryIds?.length) {
    for (const categoryId of filters.categoryIds) {
      params = params.append('categoryIds', String(categoryId));
    }
  }

  return params;
}
