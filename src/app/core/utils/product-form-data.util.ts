import { CreateProductRequest } from '../models/products/product-request.models';

export function buildCreateProductFormData(
  request: CreateProductRequest,
  images: File[] = [],
): FormData {
  const formData = new FormData();
  formData.append(
    'product',
    new Blob([JSON.stringify(request)], { type: 'application/json' }),
  );
  for (const file of images) {
    formData.append('images', file);
  }
  return formData;
}

export function buildAddImagesFormData(files: File[]): FormData {
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }
  return formData;
}
