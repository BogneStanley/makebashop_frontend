export interface MoneyResponse {
  amount: number;
  currency: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface ProductVariantResponse {
  id: number;
  sku: string;
  price: MoneyResponse;
  stockQuantity: number;
  color: string;
  size: string;
}

export interface ProductImageResponse {
  id: number;
  url: string;
  name: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  categories: CategoryResponse[];
  images: ProductImageResponse[];
  productVariants: ProductVariantResponse[];
}
