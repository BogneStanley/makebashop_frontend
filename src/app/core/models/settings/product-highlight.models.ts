import { ProductResponse } from '../products/product-response.models';

export type ProductHighlightType = 'NEW' | 'POPULAR' | 'FEATURED';

export interface ProductHighlightListResponse {
  configured: boolean;
  products: ProductResponse[];
}

export interface ProductHighlightsConfigResponse {
  newProducts: ProductHighlightListResponse;
  popularProducts: ProductHighlightListResponse;
  featuredProducts: ProductHighlightListResponse;
}

export interface SetProductHighlightsRequest {
  productIds: number[];
}
