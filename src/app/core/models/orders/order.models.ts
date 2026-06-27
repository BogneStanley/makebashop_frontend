import { PaginationParams } from '../common/pagination.models';
import { MoneyResponse } from '../products/product-response.models';
import { OrderResponse } from './order-response.models';

export const ORDER_STATUSES = ['PENDING', 'PAID', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ManagedOrderFilters extends PaginationParams {
  orderNumber?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface OrderListItemView extends OrderResponse {
  customerFullName: string;
}

export function toOrderListItemView(order: OrderResponse): OrderListItemView {
  return {
    ...order,
    customerFullName: `${order.customerFirstName} ${order.customerLastName}`.trim(),
  };
}

export function formatMoney(money: MoneyResponse): string {
  return `${new Intl.NumberFormat('fr-FR').format(money.amount)} ${money.currency}`;
}

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'PAID':
      return 'Payée';
    case 'CANCELLED':
      return 'Annulée';
    default:
      return status;
  }
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}
