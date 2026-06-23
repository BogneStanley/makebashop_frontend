import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  getCartItems() {
    return this.cartItems;
  }

  getCartCount(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  generateItemId(productId: number, size?: string, color?: string): string {
    return `${productId}-${size || 'no-size'}-${color || 'no-color'}`;
  }

  addToCart(
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string
  ): void {
    const id = this.generateItemId(product.id, selectedSize, selectedColor);
    const existing = this.cartItems().find((item) => item.id === id);

    if (existing) {
      this.cartItems.update((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      this.cartItems.update((items) => [
        ...items,
        { id, product, quantity, selectedSize, selectedColor },
      ]);
    }
  }

  removeFromCart(id: string): void {
    this.cartItems.update((items) => items.filter((item) => item.id !== id));
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }
    this.cartItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}
