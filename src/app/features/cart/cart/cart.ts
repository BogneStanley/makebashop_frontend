import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { CartService } from '../../../core/services/cart.service';
import { WhatsappOrderingService } from '../../../core/services/whatsapp-ordering.service';
import { CartItemQuantity } from '../../../shared/cart-item-quantity/cart-item-quantity';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    CurrencyPipe,
    Header,
    Footer,
    ButtonModule,
    ProgressSpinnerModule,
    RouterModule,
    CartItemQuantity,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);
  private whatsappOrderingService = inject(WhatsappOrderingService);

  cartItems = this.cartService.getCartItems();
  whatsappOrderingEnabled = this.whatsappOrderingService.enabled;
  cartTotal = computed(() => this.cartService.getCartTotal());
  cartCount = computed(() => this.cartService.getCartCount());
  loading = this.cartService.isLoading();
  clearing = this.cartService.isClearingCart();
  variantLoading = this.cartService.getVariantLoading();

  removeItem(variantId: number): void {
    if (this.variantLoading()[variantId]) {
      return;
    }

    this.cartService.removeFromCart(variantId).subscribe();
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  continueShopping(): void {
    this.cartService.flushAllDraftQuantities();
    window.history.back();
  }

  orderViaWhatsapp(): void {
    this.cartService.flushAllDraftQuantities();
    this.whatsappOrderingService.orderCart(this.cartItems(), this.cartTotal());
  }
}
