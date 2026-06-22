import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProductCard } from '../../../shared/product-card/product-card';
import { ProductService, Product } from '../../../core/services/product.service';

import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-search',
  imports: [
    CommonModule,
    FormsModule,
    Header,
    Footer,
    ProductCard,
    InputTextModule,
    SliderModule,
    CheckboxModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './product-search.html',
  styleUrl: './product-search.css',
})
export class ProductSearch {
  private productService = inject(ProductService);

  // Filter States
  searchQuery = signal<string>('');
  selectedCategories = signal<string[]>([]);
  priceRange = signal<number[]>([0, 500]);
  inStockOnly = signal<boolean>(false);

  // Sorting
  sortOptions: SortOption[] = [
    { label: 'Pertinence', value: 'default' },
    { label: 'Prix : croissant', value: 'price-asc' },
    { label: 'Prix : décroissant', value: 'price-desc' },
    { label: 'Nom : A-Z', value: 'name-asc' },
    { label: 'Nom : Z-A', value: 'name-desc' },
  ];
  selectedSort = signal<SortOption>(this.sortOptions[0]);

  // Categories list
  categories = computed(() => this.productService.getCategories());

  // Filtered & Sorted products list
  filteredProducts = computed<Product[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cats = this.selectedCategories();
    const range = this.priceRange();
    const stockOnly = this.inStockOnly();
    const sort = this.selectedSort().value;

    let results = this.productService.getProducts()();

    // 1. Search Query
    if (query) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // 2. Categories
    if (cats.length > 0) {
      results = results.filter((p) => cats.includes(p.category));
    }

    // 3. Price Range
    results = results.filter((p) => p.price >= range[0] && p.price <= range[1]);

    // 4. Stock Availability
    if (stockOnly) {
      results = results.filter((p) => p.stock > 0);
    }

    // 5. Sorting
    if (sort === 'price-asc') {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name-desc') {
      results = [...results].sort((a, b) => b.name.localeCompare(a.name));
    }

    return results;
  });

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.priceRange.set([0, 500]);
    this.inStockOnly.set(false);
    this.selectedSort.set(this.sortOptions[0]);
  }
}
