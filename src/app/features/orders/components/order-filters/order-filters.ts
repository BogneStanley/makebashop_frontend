import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { OrderStatus } from '../../../../core/models/orders/order.models';

export interface OrderListFilters {
  orderNumber: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-order-filters',
  imports: [
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    ButtonModule,
    DrawerModule,
  ],
  templateUrl: './order-filters.html',
  styleUrl: './order-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFilters implements OnDestroy {
  disabled = input(false);
  filters = input<OrderListFilters>({ orderNumber: '' });

  filtersChange = output<OrderListFilters>();

  orderNumber = signal('');
  drawerOpen = signal(false);
  status = signal<OrderStatus | 'all'>('all');
  startDate = signal('');
  endDate = signal('');

  private searchTimer?: ReturnType<typeof setTimeout>;

  statusOptions = [
    { label: 'Tous', value: 'all' as const },
    { label: 'En attente', value: 'PENDING' as const },
    { label: 'Payée', value: 'PAID' as const },
    { label: 'Annulée', value: 'CANCELLED' as const },
  ];

  constructor() {
    effect(() => {
      this.syncFromFilters(this.filters());
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  onOrderNumberChange(value: string): void {
    this.orderNumber.set(value);
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
    this.status.set('all');
    this.startDate.set('');
    this.endDate.set('');
    this.emitFilters();
  }

  private syncFromFilters(filters: OrderListFilters): void {
    clearTimeout(this.searchTimer);
    this.orderNumber.set(filters.orderNumber);
    this.status.set(filters.status ?? 'all');
    this.startDate.set(filters.startDate ?? '');
    this.endDate.set(filters.endDate ?? '');

    if (this.isDefaultFilters(filters)) {
      this.drawerOpen.set(false);
    }
  }

  private isDefaultFilters(filters: OrderListFilters): boolean {
    return (
      !filters.orderNumber &&
      !filters.status &&
      !filters.startDate &&
      !filters.endDate
    );
  }

  private emitFilters(): void {
    const filters: OrderListFilters = {
      orderNumber: this.orderNumber().trim(),
    };

    if (this.status() !== 'all') {
      filters.status = this.status() as OrderStatus;
    }
    if (this.startDate()) {
      filters.startDate = this.startDate();
    }
    if (this.endDate()) {
      filters.endDate = this.endDate();
    }

    this.filtersChange.emit(filters);
  }
}
