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
import { finalize } from 'rxjs';
import { CategoryResponse } from '../../../core/models/products/product-response.models';
import { ProductResponse } from '../../../core/models/products/product-response.models';
import {
  ManagedProductFilters,
  ProductListItemView,
  toProductListItemView,
} from '../../../core/models/products/product.models';
import { CategoryService } from '../../../core/services/category.service';
import { ManagedProductService } from '../../../core/services/managed-product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { ProductFilters, ProductListFilters } from '../components/product-filters/product-filters';
import { ProductTable } from '../components/product-table/product-table';

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
  private categoryService = inject(CategoryService);
  private managedProductService = inject(ManagedProductService);

  categories = this.categoryService.categoriesList;

  products = signal<ProductListItemView[]>([]);
  loading = signal(true);
  deleting = signal(false);
  error = signal<string | null>(null);
  page = signal(0);
  pageSize = signal(5);
  totalElements = signal(0);
  filters = signal<ProductListFilters>({ name: '' });

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingDeleteId = signal<number | null>(null);

  paginatedProducts = computed(() => this.products());
  activeFilterLabels = computed(() => this.buildActiveFilterLabels(this.filters()));

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe();
    this.loadProducts();
  }

  onFiltersChange(filters: ProductListFilters): void {
    this.filters.set(filters);
    this.page.set(0);
    this.loadProducts();
  }

  clearAllFilters(): void {
    this.filters.set({ name: '' });
    this.page.set(0);
    this.loadProducts();
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.loadProducts();
  }

  goToCreate(): void {
    this.router.navigate(['/manage/products/new']);
  }

  onEdit(productId: number): void {
    const product = this.products().find((item) => item.id === productId);
    this.router.navigate(['/manage/products', productId, 'edit'], {
      state: product ? { product } : undefined,
    });
  }

  onActivate(productId: number): void {
    this.managedProductService.activateProduct(productId).subscribe((product) => {
      if (product) {
        this.updateProductInList(product);
        this.notifications.success('Produit activé.');
      }
    });
  }

  onDeactivate(productId: number): void {
    this.managedProductService.deactivateProduct(productId).subscribe((product) => {
      if (product) {
        this.updateProductInList(product);
        this.notifications.info('Produit désactivé.');
      }
    });
  }

  onDeleteRequest(productId: number): void {
    const product = this.products().find((item) => item.id === productId);
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
    if (productId === null || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.managedProductService
      .deleteProduct(productId)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe((success) => {
        if (success) {
          this.notifications.success('Produit supprimé.');
          this.loadProducts();
        }
        this.pendingDeleteId.set(null);
        this.confirmVisible.set(false);
      });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    const uiFilters = this.filters();
    const apiFilters: ManagedProductFilters = {
      page: this.page(),
      size: this.pageSize(),
      sortBy: 'name',
      sortOrder: 'asc',
      name: uiFilters.name,
      minPrice: uiFilters.minPrice,
      maxPrice: uiFilters.maxPrice,
      inStock: uiFilters.inStock,
      isActive: uiFilters.isActive,
      categoryIds: uiFilters.categoryIds,
    };

    this.managedProductService
      .listManaged(apiFilters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((result) => {
        if (!result) {
          this.error.set('Impossible de charger les produits.');
          this.products.set([]);
          this.totalElements.set(0);
          return;
        }

        this.products.set(result.content.map(toProductListItemView));
        this.totalElements.set(result.totalElements);
      });
  }

  private updateProductInList(product: ProductResponse): void {
    const view = toProductListItemView(product);
    this.products.update((items) =>
      items.map((item) => (item.id === view.id ? view : item)),
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
      const names = this.categories()
        .filter((category: CategoryResponse) => filters.categoryIds!.includes(category.id))
        .map((category) => category.name);
      if (names.length) {
        labels.push(`Catégories : ${names.join(', ')}`);
      }
    }

    return labels;
  }
}
