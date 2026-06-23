import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { CartService } from '../../../core/services/cart.service';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, CurrencyPipe, Header, Footer, ButtonModule, InputNumberModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);

  cartItems = this.cartService.getCartItems();
  cartTotal = computed(() => this.cartService.getCartTotal());
  cartCount = computed(() => this.cartService.getCartCount());

  onQuantityChange(itemId: string, event: { value: number | undefined }): void {
    this.cartService.updateQuantity(itemId, event.value || 1);
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  continueShopping(): void {
    window.history.back();
  }
}
