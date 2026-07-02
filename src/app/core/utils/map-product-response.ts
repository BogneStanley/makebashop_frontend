import { ProductResponse } from '../models/products/product-response.models';
import { getPrimaryImage, getTotalStock } from '../models/products/product.models';
import { Product } from '../services/product.service';

export function toShopProduct(product: ProductResponse): Product {
  const primaryImage = getPrimaryImage(product);
  const prices = product.productVariants.map((variant) => variant.price.amount);

  return {
    id: product.id,
    name: product.name,
    price: prices.length ? Math.min(...prices) : 0,
    image: primaryImage?.url ?? product.images[0]?.url ?? '',
    images: product.images.map((image) => image.url),
    description: product.description,
    category: product.categories.map((category) => category.name).join(', '),
    stock: getTotalStock(product),
    sizes: [...new Set(product.productVariants.map((variant) => variant.size).filter(Boolean))],
    colors: [...new Set(product.productVariants.map((variant) => variant.color).filter(Boolean))],
  };
}
