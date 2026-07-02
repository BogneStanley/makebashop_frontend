import { ProductResponse } from '../models/products/product-response.models';
import { getPrimaryImage, getTotalStock } from '../models/products/product.models';
import {
  getAllSizes,
  getCheapestVariant,
  getUniqueColors,
  hasVariablePrices,
  toSortedShopVariants,
} from '../models/products/shop-product.models';
import { Product } from '../services/product.service';

export function toShopProduct(product: ProductResponse): Product {
  const primaryImage = getPrimaryImage(product);
  const variants = toSortedShopVariants(product.productVariants);
  const cheapest = getCheapestVariant(variants);

  return {
    id: product.id,
    name: product.name,
    price: cheapest?.price ?? 0,
    image: primaryImage?.url ?? product.images[0]?.url ?? '',
    images: product.images.map((image) => image.url),
    description: product.description,
    category: product.categories.map((category) => category.name).join(', '),
    stock: getTotalStock(product),
    sizes: getAllSizes(variants),
    colors: getUniqueColors(variants),
    variants,
    hasVariablePrice: hasVariablePrices(variants),
  };
}
