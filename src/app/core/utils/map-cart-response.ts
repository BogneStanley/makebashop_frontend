import { CartItemResponse } from '../models/cart/cart-response.models';
import { getPrimaryImage } from '../models/products/product.models';
import { CartItem } from '../services/cart.service';

export function mapCartItemResponse(item: CartItemResponse): CartItem {
  const primaryImage = getPrimaryImage(item.product);

  return {
    id: String(item.variant.id),
    variantId: item.variant.id,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.variant.price.amount,
      image: primaryImage?.url ?? item.product.images[0]?.url ?? '',
      images: item.product.images.map((image) => image.url),
      description: item.product.description,
      category: item.product.categories.map((category) => category.name).join(', '),
      stock: item.variant.stockQuantity,
    },
    quantity: item.quantity,
    selectedSize: item.variant.size || undefined,
    selectedColor: item.variant.color || undefined,
  };
}
