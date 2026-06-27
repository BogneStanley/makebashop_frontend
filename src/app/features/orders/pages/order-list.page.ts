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
import {
  getOrderStatusLabel,
  OrderListItemView,
  toOrderListItemView,
} from '../../../core/models/orders/order.models';
import { mockOrderListItems } from '../../../core/models/orders/order.mock';
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

  private allOrders = signal<OrderListItemView[]>(
    mockOrderListItems.map((order) => ({ ...order })),
  );

  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(0);
  pageSize = signal(5);
  filters = signal<OrderListFilters>({ orderNumber: '' });

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingAction = signal<{ id: number; type: 'paid' | 'cancelled' } | null>(null);

  filteredOrders = computed(() => {
    const { orderNumber, status, startDate, endDate } = this.filters();

    return this.allOrders().filter((order) => {
      const matchesNumber =
        !orderNumber ||
        order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase());
      const matchesStatus = !status || order.status === status;

      const orderDate = new Date(order.createdAt);
      const matchesStart = !startDate || orderDate >= new Date(`${startDate}T00:00:00`);
      const matchesEnd = !endDate || orderDate <= new Date(`${endDate}T23:59:59`);

      return matchesNumber && matchesStatus && matchesStart && matchesEnd;
    });
  });

  totalElements = computed(() => this.filteredOrders().length);

  paginatedOrders = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });

  activeFilterLabels = computed(() => this.buildActiveFilterLabels(this.filters()));

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 400);
  }

  onFiltersChange(filters: OrderListFilters): void {
    this.filters.set(filters);
    this.page.set(0);
  }

  clearAllFilters(): void {
    this.filters.set({ orderNumber: '' });
    this.page.set(0);
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.pageSize.set(event.rows ?? 5);
  }

  onView(orderId: number): void {
    this.router.navigate(['/manage/orders', orderId]);
  }

  onMarkPaidRequest(orderId: number): void {
    const order = this.allOrders().find((item) => item.id === orderId);
    this.pendingAction.set({ id: orderId, type: 'paid' });
    this.confirmData.set({
      title: 'Marquer comme payée',
      message: `Confirmer le paiement de la commande « ${order?.orderNumber ?? ''} » ?`,
      confirmLabel: 'Confirmer',
    });
    this.confirmVisible.set(true);
  }

  onMarkCancelledRequest(orderId: number): void {
    const order = this.allOrders().find((item) => item.id === orderId);
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
    if (action) {
      const newStatus = action.type === 'paid' ? 'PAID' : 'CANCELLED';
      this.updateOrderStatus(action.id, newStatus);
      const message =
        action.type === 'paid'
          ? 'Commande marquée comme payée (mock).'
          : 'Commande annulée (mock).';
      this.notifications.success(message);
    }
    this.pendingAction.set(null);
    this.confirmVisible.set(false);
  }

  private updateOrderStatus(orderId: number, status: string): void {
    const now = new Date().toISOString().slice(0, 19);
    this.allOrders.update((items) =>
      items.map((item) =>
        item.id === orderId
          ? toOrderListItemView({ ...item, status, updatedAt: now })
          : item,
      ),
    );
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
