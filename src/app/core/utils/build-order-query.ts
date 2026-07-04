import { HttpParams } from '@angular/common/http';
import { ManagedOrderFilters } from '../models/orders/order.models';

export function hasOrderSearchFilters(filters: ManagedOrderFilters): boolean {
  return !!(
    filters.orderNumber?.trim() ||
    filters.status ||
    filters.startDate ||
    filters.endDate
  );
}

export function buildOrderParams(filters: ManagedOrderFilters): HttpParams {
  let params = new HttpParams()
    .set('page', String(filters.page ?? 0))
    .set('size', String(filters.size ?? 10))
    .set('sortBy', filters.sortBy ?? 'createdAt')
    .set('sortOrder', filters.sortOrder ?? 'desc');

  const orderNumber = filters.orderNumber?.trim();
  if (orderNumber) {
    params = params.set('query', orderNumber);
  }
  if (filters.status) {
    params = params.set('status', filters.status);
  }
  if (filters.startDate) {
    params = params.set('startDate', `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    params = params.set('endDate', `${filters.endDate}T23:59:59`);
  }

  return params;
}
