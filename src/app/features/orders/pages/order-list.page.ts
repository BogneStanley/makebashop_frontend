import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { finalize } from 'rxjs';
import {
  getOrderStatusLabel,
  ManagedOrderFilters,
  OrderListItemView,
} from '../../../core/models/orders/order.models';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { OrderFilters, OrderListFilters } from '../components/order-filters/order-filters';
import { OrderTable } from '../components/order-table/order-table';

@Component({
  selector: 'app-order-list-page',
  imports: [
    PaginatorModule,
    MessageModule,
    OrderFilters,
    OrderTable,
    ConfirmDialog,
  ],
  templateUrl: './order-list.page.html',
  styleUrl: './order-list.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListPage implements OnInit {
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private orderService = inject(OrderService);

  orders = signal<OrderListItemView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(0);
  pageSize = signal(5);
  totalElements = signal(0);
  filters = signal<OrderListFilters>({ orderNumber: '' });

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingAction = signal<{ id: number; type: 'paid' | 'cancelled' } | null>(null);

  paginatedOrders = computed(() => this.orders());
  activeFilterLabels = computed(() => this.buildActiveFilterLabels(this.filters()));

  ngOnInit(): void {
    this.loadOrders();
  }

  onFiltersChange(filters: OrderListFilters): void {
    this.filters.set(filters);
    this.page.set(0);
    this.loadOrders();
  }

  clearAllFilters(): void {
    this.filters.set({ orderNumber: '' });
    this.page.set(0);
    this.loadOrders();
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.loadOrders();
  }

  onView(orderId: number): void {
    this.router.navigate(['/manage/orders', orderId]);
  }

  onMarkPaidRequest(orderId: number): void {
    const order = this.orders().find((item) => item.id === orderId);
    this.pendingAction.set({ id: orderId, type: 'paid' });
    this.confirmData.set({
      title: 'Marquer comme payée',
      message: `Confirmer le paiement de la commande « ${order?.orderNumber ?? ''} » ?`,
      confirmLabel: 'Confirmer',
    });
    this.confirmVisible.set(true);
  }

  onMarkCancelledRequest(orderId: number): void {
    const order = this.orders().find((item) => item.id === orderId);
    this.pendingAction.set({ id: orderId, type: 'cancelled' });
    this.confirmData.set({
      title: 'Annuler la commande',
      message: `Êtes-vous sûr de vouloir annuler « ${order?.orderNumber ?? ''} » ?`,
      confirmLabel: 'Annuler la commande',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmAction(): void {
    const action = this.pendingAction();
    if (!action) {
      this.confirmVisible.set(false);
      return;
    }

    const request$ =
      action.type === 'paid'
        ? this.orderService.markAsPaid(action.id)
        : this.orderService.markAsCancelled(action.id);

    request$.subscribe((success) => {
      if (success) {
        this.notifications.success(
          action.type === 'paid'
            ? 'Commande marquée comme payée.'
            : 'Commande annulée.',
        );
        this.loadOrders();
      }
      this.pendingAction.set(null);
      this.confirmVisible.set(false);
    });
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const uiFilters = this.filters();
    const apiFilters: ManagedOrderFilters = {
      page: this.page(),
      size: this.pageSize(),
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (uiFilters.orderNumber) {
      apiFilters.orderNumber = uiFilters.orderNumber;
    }
    if (uiFilters.status) {
      apiFilters.status = uiFilters.status;
    }
    if (uiFilters.startDate) {
      apiFilters.startDate = uiFilters.startDate;
    }
    if (uiFilters.endDate) {
      apiFilters.endDate = uiFilters.endDate;
    }

    this.orderService
      .listManaged(apiFilters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((result) => {
        if (!result) {
          this.error.set('Impossible de charger les commandes.');
          this.orders.set([]);
          this.totalElements.set(0);
          return;
        }

        this.orders.set(result.content);
        this.totalElements.set(result.totalElements);
      });
  }

  private buildActiveFilterLabels(filters: OrderListFilters): string[] {
    const labels: string[] = [];
    const dateFormat = new Intl.DateTimeFormat('fr-FR');

    if (filters.orderNumber) {
      labels.push(`N° : « ${filters.orderNumber} »`);
    }
    if (filters.status) {
      labels.push(`Statut : ${getOrderStatusLabel(filters.status)}`);
    }
    if (filters.startDate) {
      labels.push(`Du : ${dateFormat.format(new Date(filters.startDate))}`);
    }
    if (filters.endDate) {
      labels.push(`Au : ${dateFormat.format(new Date(filters.endDate))}`);
    }

    return labels;
  }
}
