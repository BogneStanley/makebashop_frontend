import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import {
  formatMoney,
  formatOrderDate,
} from '../../../core/models/orders/order.models';
import { OrderResponse } from '../../../core/models/orders/order-response.models';
import { getMockOrderById } from '../../../core/models/orders/order.mock';
import { getPrimaryImage } from '../../../core/models/products/product.models';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { OrderStatusBadge } from '../components/order-status-badge/order-status-badge';

@Component({
  selector: 'app-order-detail-page',
  imports: [
    ButtonModule,
    MessageModule,
    TableModule,
    OrderStatusBadge,
    ConfirmDialog,
  ],
  templateUrl: './order-detail.page.html',
  styleUrl: './order-detail.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  order = signal<OrderResponse | null>(null);
  loading = signal(true);
  notFound = signal(false);

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingAction = signal<'paid' | 'cancelled' | null>(null);

  formatMoney = formatMoney;
  formatDate = formatOrderDate;
  getPrimaryImage = getPrimaryImage;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    setTimeout(() => {
      const found = getMockOrderById(id);
      if (found) {
        this.order.set({ ...found });
      } else {
        this.notFound.set(true);
      }
      this.loading.set(false);
    }, 300);
  }

  goBack(): void {
    this.router.navigate(['/manage/orders']);
  }

  onMarkPaid(): void {
    this.pendingAction.set('paid');
    this.confirmData.set({
      title: 'Marquer comme payée',
      message: `Confirmer le paiement de cette commande ?`,
      confirmLabel: 'Confirmer',
    });
    this.confirmVisible.set(true);
  }

  onMarkCancelled(): void {
    this.pendingAction.set('cancelled');
    this.confirmData.set({
      title: 'Annuler la commande',
      message: 'Êtes-vous sûr de vouloir annuler cette commande ?',
      confirmLabel: 'Annuler la commande',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmAction(): void {
    const action = this.pendingAction();
    const current = this.order();
    if (action && current) {
      const newStatus = action === 'paid' ? 'PAID' : 'CANCELLED';
      const now = new Date().toISOString().slice(0, 19);
      this.order.set({ ...current, status: newStatus, updatedAt: now });
      const message =
        action === 'paid'
          ? 'Commande marquée comme payée (mock).'
          : 'Commande annulée (mock).';
      this.notifications.success(message);
    }
    this.pendingAction.set(null);
    this.confirmVisible.set(false);
  }

  customerFullName(order: OrderResponse): string {
    return `${order.customerFirstName} ${order.customerLastName}`.trim();
  }
}
