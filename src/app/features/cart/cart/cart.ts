import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { CartService } from '../../../core/services/cart.service';
import { CartItemQuantity } from '../../../shared/cart-item-quantity/cart-item-quantity';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    CurrencyPipe,
    Header,
    Footer,
    ButtonModule,
    RouterModule,
    CartItemQuantity,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);

  cartItems = this.cartService.getCartItems();
  cartTotal = computed(() => this.cartService.getCartTotal());
  cartCount = computed(() => this.cartService.getCartCount());
  loading = this.cartService.isLoading();

  removeItem(variantId: number): void {
    this.cartService.removeFromCart(variantId).subscribe();
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  continueShopping(): void {
    this.cartService.flushAllDraftQuantities();
    window.history.back();
  }
}
