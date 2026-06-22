import { Component, input, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { CardModule } from 'primeng/card';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  stock?: number;
}

@Component({
  selector: 'app-product-card',
  imports: [ButtonModule, CurrencyPipe, CommonModule, CardModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
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

  addToCart() {
    // Will be connected to cart service
  }
}
