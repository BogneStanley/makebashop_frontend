import { MoneyResponse } from '../products/product-response.models';
import { ProductResponse } from '../products/product-response.models';
import { ProductVariantResponse } from '../products/product-response.models';

export interface CartItemResponse {
  id: number;
  product: ProductResponse;
  variant: ProductVariantResponse;
  quantity: number;
  subtotal: MoneyResponse;
}

export interface CartResponse {
  id: number;
  totalAmount: MoneyResponse | null;
  items: CartItemResponse[];
}
