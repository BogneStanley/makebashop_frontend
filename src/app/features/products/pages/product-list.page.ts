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
import {
  ProductListItemView,
  toActiveFilterValue,
  toProductListItemView,
} from '../../../core/models/products/product.models';
import { mockProductListItems } from '../../../core/models/products/product.mock';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { ProductFilters } from '../components/product-filters/product-filters';
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

  private allProducts = signal<ProductListItemView[]>(
    mockProductListItems.map((product) => ({ ...product })),
  );

  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(0);
  pageSize = signal(5);
  filters = signal({
    name: '',
    activeFilter: 'all' as 'all' | 'active' | 'inactive',
    inStock: null as boolean | null,
  });

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingDeleteId = signal<number | null>(null);

  filteredProducts = computed(() => {
    const { name, activeFilter, inStock } = this.filters();
    const activeValue = toActiveFilterValue(activeFilter);

    return this.allProducts().filter((product) => {
      const matchesName = !name || product.name.toLowerCase().includes(name.toLowerCase());
      const matchesActive = activeValue === undefined || product.isActive === activeValue;
      const matchesStock =
        inStock === null || (inStock ? product.totalStock > 0 : product.totalStock === 0);
      return matchesName && matchesActive && matchesStock;
    });
  });

  totalElements = computed(() => this.filteredProducts().length);

  paginatedProducts = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 400);
  }

  onFiltersChange(filters: {
    name: string;
    activeFilter: 'all' | 'active' | 'inactive';
    inStock: boolean | null;
  }): void {
    this.filters.set(filters);
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
}
