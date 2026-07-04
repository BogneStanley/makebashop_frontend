import { Component, computed, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { CartItemQuantity } from '../cart-item-quantity/cart-item-quantity';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-cart-sidebar',
  imports: [
    CommonModule,
    CurrencyPipe,
    ButtonModule,
    DrawerModule,
    ProgressSpinnerModule,
    RouterModule,
    CartItemQuantity,
  ],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
})
export class CartSidebar {
  visible = input.required<boolean>();
  onClose = output<void>();

  private cartService = inject(CartService);
  private router = inject(Router);

  cartItems = this.cartService.getCartItems();
  cartTotal = computed(() => this.cartService.getCartTotal());
  cartCount = computed(() => this.cartService.getCartCount());
  loading = this.cartService.isLoading();
  variantLoading = this.cartService.getVariantLoading();

  removeItem(variantId: number): void {
    if (this.variantLoading()[variantId]) {
      return;
    }

    this.cartService.removeFromCart(variantId).subscribe();
  }

  close(): void {
    this.cartService.flushAllDraftQuantities();
    this.onClose.emit();
  }

  navigateToCart(): void {
    this.close();
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1000);
  }
}
