import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProductResponse } from '../../../../core/models/products/product-response.models';
import { ProductStatusBadge } from '../product-status-badge/product-status-badge';

@Component({
  selector: 'app-product-edit-header',
  imports: [ButtonModule, ProductStatusBadge],
  templateUrl: './product-edit-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditHeader {
  product = input.required<ProductResponse>();
  saving = input(false);

  activate = output<void>();
  deactivate = output<void>();
  delete = output<void>();
  back = output<void>();
}
