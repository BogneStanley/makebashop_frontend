export interface ProductVariantRequest {
  sku: string;
  price: number;
  stockQuantity: number;
  size: string;
  color: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  categoryIds: number[];
  productVariants: ProductVariantRequest[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  categoryIds?: number[];
}

export interface AddVariantsRequest {
  variants: ProductVariantRequest[];
}

export interface DeleteVariantsRequest {
  variantIds: number[];
}

export interface DeleteImagesRequest {
  imageIds: number[];
}

export interface UpdateImagePositionRequest {
  imageId: number;
  position: number;
}

export interface UpdateImagesPositionRequest {
  imagesPosition: UpdateImagePositionRequest[];
}
