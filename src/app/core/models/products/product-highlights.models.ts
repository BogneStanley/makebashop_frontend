import { ProductResponse } from './product-response.models';

export interface ProductHighlightsResponse {
  newProducts: ProductResponse[];
  popularProducts: ProductResponse[];
  featuredProducts: ProductResponse[];
}
