import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CategoryResponse } from '../../../../core/models/products/product-response.models';

export interface ProductListFilters {
  name: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  categoryIds?: number[];
}

@Component({
  selector: 'app-product-filters',
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    ButtonModule,
    DrawerModule,
  ],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFilters implements OnDestroy {
  categories = input.required<CategoryResponse[]>();
  disabled = input(false);

  filtersChange = output<ProductListFilters>();

  name = signal('');
  drawerOpen = signal(false);

  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockEnabled = signal(false);
  inStock = signal(true);
  isActiveFilter = signal<'all' | 'active' | 'inactive'>('all');
  categoryIds = signal<number[]>([]);

  private searchTimer?: ReturnType<typeof setTimeout>;

  activeFilterOptions = [
    { label: 'Tous', value: 'all' as const },
    { label: 'Actif', value: 'active' as const },
    { label: 'Inactif', value: 'inactive' as const },
  ];

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  onNameChange(value: string): void {
    this.name.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.emitFilters(), 300);
  }

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  applyDrawerFilters(): void {
    this.emitFilters();
    this.closeDrawer();
  }

  resetDrawerFilters(): void {
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockEnabled.set(false);
    this.inStock.set(true);
    this.isActiveFilter.set('all');
    this.categoryIds.set([]);
    this.emitFilters();
  }

  resetAll(): void {
    clearTimeout(this.searchTimer);
    this.name.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockEnabled.set(false);
    this.inStock.set(true);
    this.isActiveFilter.set('all');
    this.categoryIds.set([]);
    this.drawerOpen.set(false);
    this.emitFilters();
  }

  private emitFilters(): void {
    const filters: ProductListFilters = {
      name: this.name().trim(),
    };

    if (this.minPrice() !== null) {
      filters.minPrice = this.minPrice()!;
    }
    if (this.maxPrice() !== null) {
      filters.maxPrice = this.maxPrice()!;
    }
    if (this.inStockEnabled()) {
      filters.inStock = this.inStock();
    }
    if (this.isActiveFilter() !== 'all') {
      filters.isActive = this.isActiveFilter() === 'active';
    }
    if (this.categoryIds().length > 0) {
      filters.categoryIds = [...this.categoryIds()];
    }

    this.filtersChange.emit(filters);
  }
}
