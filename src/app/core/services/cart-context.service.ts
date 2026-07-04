import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const CART_ID_STORAGE_KEY = 'shop_cart_id';

@Injectable({
  providedIn: 'root',
})
export class CartContextService {
  private platformId = inject(PLATFORM_ID);
  private cartId = signal<number | null>(null);

  constructor() {
    this.restoreFromStorage();
  }

  getCartId(): number | null {
    return this.cartId();
  }

  setCartId(id: number): void {
    this.cartId.set(id);

    if (this.isBrowser()) {
      localStorage.setItem(CART_ID_STORAGE_KEY, String(id));
    }
  }

  clearCartId(): void {
    this.cartId.set(null);

    if (this.isBrowser()) {
      localStorage.removeItem(CART_ID_STORAGE_KEY);
    }
  }

  private restoreFromStorage(): void {
    if (!this.isBrowser()) {
      return;
    }

    const stored = localStorage.getItem(CART_ID_STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      this.cartId.set(parsed);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
