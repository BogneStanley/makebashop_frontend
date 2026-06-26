import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { ProductListItemView } from '../../../../core/models/products/product.models';
import { ProductStatusBadge } from '../product-status-badge/product-status-badge';

@Component({
  selector: 'app-product-table',
  imports: [TableModule, ButtonModule, MenuModule, SkeletonModule, ProductStatusBadge],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTable {
  products = input.required<ProductListItemView[]>();
  loading = input(false);

  edit = output<number>();
  activate = output<number>();
  deactivate = output<number>();
  delete = output<number>();

  menu = viewChild.required<Menu>('actionMenu');
  menuItems: MenuItem[] = [];

  openMenu(event: Event, product: ProductListItemView): void {
    this.menuItems = [
      {
        label: 'Éditer',
        icon: 'pi pi-pencil',
        command: () => this.edit.emit(product.id),
      },
      product.isActive
        ? {
            label: 'Désactiver',
            icon: 'pi pi-ban',
            command: () => this.deactivate.emit(product.id),
          }
        : {
            label: 'Activer',
            icon: 'pi pi-check-circle',
            command: () => this.activate.emit(product.id),
          },
      { separator: true },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        styleClass: 'text-red-600',
        command: () => this.delete.emit(product.id),
      },
    ];
    this.menu().toggle(event);
  }

  categoriesLabel(product: ProductListItemView): string {
    return product.categories.map((category) => category.name).join(', ') || '—';
  }
}
