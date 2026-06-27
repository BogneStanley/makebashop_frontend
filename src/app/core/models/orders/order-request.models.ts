import { OrderStatus } from './order.models';

export interface SearchOrderRequest {
  orderNumber?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
