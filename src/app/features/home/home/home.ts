import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { Hero } from '../hero/hero';
import { ProductCard } from '../../../shared/product-card/product-card';
import { ProductService, Product } from '../../../core/services/product.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer, Hero, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private productService = inject(ProductService);

  nouveautes = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);

  constructor() {
    const allProducts = this.productService.getProducts()();
    // Nouveautés: products with id 1, 2, 3, 4
    this.nouveautes.set(allProducts.filter((p) => [1, 2, 3, 4].includes(p.id)));
    // Best sellers: products with id 5, 6, 7, 8
    this.bestSellers.set(allProducts.filter((p) => [5, 6, 7, 8].includes(p.id)));
  }
}
