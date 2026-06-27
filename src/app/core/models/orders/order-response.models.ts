import {
  MoneyResponse,
  ProductResponse,
  ProductVariantResponse,
} from '../products/product-response.models';

export interface OrderItemResponse {
  id: number;
  product: ProductResponse;
  variant: ProductVariantResponse;
  quantity: number;
  price: MoneyResponse;
  subtotal: MoneyResponse;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  note: string | null;
  totalAmount: MoneyResponse;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}
