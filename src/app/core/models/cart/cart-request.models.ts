export interface AddToCartRequest {
  productId: number;
  variantId: number;
  quantity: number;
}

export interface UpdateVariantQuantityRequest {
  variantId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  variantsQuantity: UpdateVariantQuantityRequest[];
}
