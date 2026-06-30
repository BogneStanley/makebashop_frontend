import { OrderResponse } from './order-response.models';

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CreateOrderRequest {
  customerFirstName: string;
  customerLastName: string;
  customerEmail?: string;
  customerPhoneNumber: string;
  note?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderResponse {
  order: OrderResponse;
  whatsappUrl: string;
}
