import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';
import {
  formatMoney,
  formatOrderDate,
  OrderListItemView,
} from '../../../../core/models/orders/order.models';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';

@Component({
  selector: 'app-order-table',
  imports: [TableModule, ButtonModule, MenuModule, SkeletonModule, TagModule, OrderStatusBadge],
  templateUrl: './order-table.html',
  styleUrl: './order-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTable {
  orders = input.required<OrderListItemView[]>();
  loading = input(false);
  activeFilters = input<string[]>([]);

  view = output<number>();
  markPaid = output<number>();
  markCancelled = output<number>();
  clearFilters = output<void>();

  menu = viewChild.required<Menu>('actionMenu');
  menuItems: MenuItem[] = [];

  formatMoney = formatMoney;
  formatDate = formatOrderDate;

  openMenu(event: Event, order: OrderListItemView): void {
    const items: MenuItem[] = [
      {
        label: 'Voir le détail',
        icon: 'pi pi-eye',
        command: () => this.view.emit(order.id),
      },
    ];

    if (order.status === 'PENDING') {
      items.push(
        {
          label: 'Marquer comme payée',
          icon: 'pi pi-check-circle',
          command: () => this.markPaid.emit(order.id),
        },
        { separator: true },
        {
          label: 'Annuler',
          icon: 'pi pi-times-circle',
          styleClass: 'text-red-600',
          command: () => this.markCancelled.emit(order.id),
        },
      );
    }

    this.menuItems = items;
    this.menu().toggle(event);
  }
}
