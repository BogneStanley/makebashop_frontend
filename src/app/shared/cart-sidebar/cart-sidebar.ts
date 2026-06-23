import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DrawerModule } from 'primeng/drawer';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-cart-sidebar',
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    DrawerModule,
    RouterModule,
  ],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
})
export class CartSidebar {
  visible = input.required<boolean>();
  onClose = output<void>();

  private cartService = inject(CartService);
  private router = inject(Router);

  get cartItems() {
    return this.cartService.getCartItems()();
  }

  get cartTotal() {
    return this.cartService.getCartTotal();
  }

  get cartCount() {
    return this.cartService.getCartCount();
  }

  onQuantityChange(itemId: string, event: { value: number | undefined }) {
    this.cartService.updateQuantity(itemId, event.value || 1);
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  close(): void {
    this.onClose.emit();
  }

  navigateToCart(): void {
    this.close();
    // Petit délai pour laisser le drawer se fermer complètement
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1000);
  }
}
