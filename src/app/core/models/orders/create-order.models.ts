import { OrderResponse } from './order-response.models';

/** Corps de POST /orders/checkout */
export interface CheckoutOrderRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  note?: string;
}

export interface CheckoutCustomerInfo {
  customerFirstName: string;
  customerLastName: string;
  customerEmail?: string;
  customerPhoneNumber: string;
  note?: string;
}

export interface CreateOrderResponse {
  order: OrderResponse;
  whatsappUrl: string;
}
