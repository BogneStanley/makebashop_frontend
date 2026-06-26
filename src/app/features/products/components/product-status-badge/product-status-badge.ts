import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

export interface ProductStatusBadgeInputs {
  isActive: boolean;
}

@Component({
  selector: 'app-product-status-badge',
  imports: [TagModule],
  template: `
    <p-tag
      [value]="isActive() ? 'Actif' : 'Inactif'"
      [severity]="isActive() ? 'success' : 'secondary'"
      class="text-[10px] uppercase tracking-wider font-semibold"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductStatusBadge {
  isActive = input.required<boolean>();
}
