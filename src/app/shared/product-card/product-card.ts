import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  imports: [ButtonModule, CurrencyPipe, CommonModule, CardModule, RouterModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  private cartService = inject(CartService);

  product = input.required<Product>();
  isHovered = signal(false);

  get image() {
    return this.product().image;
  }
  get name() {
    return this.product().name;
  }
  get price() {
    return this.product().price;
  }
  get description() {
    return this.product().description;
  }
  get stock() {
    return this.product().stock;
  }

  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }

  addToCart(): void {
    this.cartService.addToCart(this.product(), 1);
  }
}
