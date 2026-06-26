import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CategoryResponse } from '../../../core/models/products/product-response.models';
import { ProductListItemView, toProductListItemView } from '../../../core/models/products/product.models';
import { mockCategories, mockProductListItems } from '../../../core/models/products/product.mock';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { ProductFilters, ProductListFilters } from '../components/product-filters/product-filters';
import { ProductTable } from '../components/product-table/product-table';

function getMinVariantPrice(product: ProductListItemView): number {
  if (product.productVariants.length === 0) {
    return 0;
  }
  return Math.min(...product.productVariants.map((variant) => variant.price.amount));
}

@Component({
  selector: 'app-product-list-page',
  imports: [
    RouterModule,
    ButtonModule,
    PaginatorModule,
    MessageModule,
    ProductFilters,
    ProductTable,
    ConfirmDialog,
  ],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  private router = inject(Router);
  private notifications = inject(NotificationService);

  categories = mockCategories;

  private allProducts = signal<ProductListItemView[]>(
    mockProductListItems.map((product) => ({ ...product })),
  );

  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(0);
  pageSize = signal(5);
  filters = signal<ProductListFilters>({ name: '' });

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingDeleteId = signal<number | null>(null);

  filteredProducts = computed(() => {
    const { name, minPrice, maxPrice, inStock, isActive, categoryIds } = this.filters();

    return this.allProducts().filter((product) => {
      const matchesName = !name || product.name.toLowerCase().includes(name.toLowerCase());
      const price = getMinVariantPrice(product);
      const matchesMinPrice = minPrice === undefined || price >= minPrice;
      const matchesMaxPrice = maxPrice === undefined || price <= maxPrice;
      const matchesActive = isActive === undefined || product.isActive === isActive;
      const matchesStock =
        inStock === undefined || (inStock ? product.totalStock > 0 : product.totalStock === 0);
      const matchesCategories =
        !categoryIds?.length ||
        product.categories.some((category) => categoryIds.includes(category.id));

      return (
        matchesName &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesActive &&
        matchesStock &&
        matchesCategories
      );
    });
  });

  totalElements = computed(() => this.filteredProducts().length);

  paginatedProducts = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  activeFilterLabels = computed(() => this.buildActiveFilterLabels(this.filters()));

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 400);
  }

  onFiltersChange(filters: ProductListFilters): void {
    this.filters.set(filters);
    this.page.set(0);
  }

  clearAllFilters(): void {
    this.filters.set({ name: '' });
    this.page.set(0);
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.pageSize.set(event.rows ?? 5);
  }

  goToCreate(): void {
    this.router.navigate(['/manage/products/new']);
  }

  onEdit(productId: number): void {
    this.router.navigate(['/manage/products', productId, 'edit']);
  }

  onActivate(productId: number): void {
    this.updateProductStatus(productId, true);
    this.notifications.success('Produit activé (mock).');
  }

  onDeactivate(productId: number): void {
    this.updateProductStatus(productId, false);
    this.notifications.info('Produit désactivé (mock).');
  }

  onDeleteRequest(productId: number): void {
    const product = this.allProducts().find((item) => item.id === productId);
    this.pendingDeleteId.set(productId);
    this.confirmData.set({
      title: 'Supprimer le produit',
      message: `Êtes-vous sûr de vouloir supprimer « ${product?.name ?? 'ce produit'} » ?`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmDelete(): void {
    const productId = this.pendingDeleteId();
    if (productId !== null) {
      this.allProducts.update((items) => items.filter((item) => item.id !== productId));
      this.notifications.success('Produit supprimé (mock).');
    }
    this.pendingDeleteId.set(null);
    this.confirmVisible.set(false);
  }

  private updateProductStatus(productId: number, isActive: boolean): void {
    this.allProducts.update((items) =>
      items.map((item) =>
        item.id === productId ? toProductListItemView({ ...item, isActive }) : item,
      ),
    );
  }

  private buildActiveFilterLabels(filters: ProductListFilters): string[] {
    const labels: string[] = [];
    const priceFormat = new Intl.NumberFormat('fr-FR');

    if (filters.name) {
      labels.push(`Nom : « ${filters.name} »`);
    }
    if (filters.minPrice !== undefined) {
      labels.push(`Prix min : ${priceFormat.format(filters.minPrice)} FCFA`);
    }
    if (filters.maxPrice !== undefined) {
      labels.push(`Prix max : ${priceFormat.format(filters.maxPrice)} FCFA`);
    }
    if (filters.isActive !== undefined) {
      labels.push(filters.isActive ? 'Statut : Actif' : 'Statut : Inactif');
    }
    if (filters.inStock !== undefined) {
      labels.push(filters.inStock ? 'En stock' : 'Rupture de stock');
    }
    if (filters.categoryIds?.length) {
      const names = this.categories
        .filter((category: CategoryResponse) => filters.categoryIds!.includes(category.id))
        .map((category) => category.name);
      if (names.length) {
        labels.push(`Catégories : ${names.join(', ')}`);
      }
    }

    return labels;
  }
}
