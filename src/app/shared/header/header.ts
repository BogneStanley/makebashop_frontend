import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartSidebar } from '../cart-sidebar/cart-sidebar';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, BadgeModule, RouterModule, CartSidebar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private cartService = inject(CartService);

  isMenuOpen = signal(false);
  isCartOpen = signal(false);

  cartItemsCount = computed(() => this.cartService.getCartCount());

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  toggleCart(): void {
    this.isCartOpen.update((open) => !open);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }
}
