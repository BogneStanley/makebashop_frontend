import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { getOrderStatusLabel } from '../../../../core/models/orders/order.models';

@Component({
  selector: 'app-order-status-badge',
  imports: [TagModule],
  template: `
    <p-tag
      [value]="label()"
      [severity]="severity()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusBadge {
  status = input.required<string>();

  label = computed(() => getOrderStatusLabel(this.status()));

  severity = computed(() => {
    switch (this.status()) {
      case 'PAID':
        return 'success' as const;
      case 'CANCELLED':
        return 'danger' as const;
      default:
        return 'warn' as const;
    }
  });
}
