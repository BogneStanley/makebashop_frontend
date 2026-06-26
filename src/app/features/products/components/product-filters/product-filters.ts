import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-product-filters',
  imports: [FormsModule, InputTextModule, SelectModule, CheckboxModule, ButtonModule],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFilters {
  disabled = input(false);

  filtersChange = output<{
    name: string;
    activeFilter: 'all' | 'active' | 'inactive';
    inStock: boolean | null;
  }>();

  name = signal('');
  activeFilter = signal<'all' | 'active' | 'inactive'>('all');
  inStockOnly = signal(false);
  inStockFilterEnabled = signal(false);

  activeFilterOptions = [
    { label: 'Tous', value: 'all' as const },
    { label: 'Actif', value: 'active' as const },
    { label: 'Inactif', value: 'inactive' as const },
  ];

  emitFilters(): void {
    this.filtersChange.emit({
      name: this.name().trim(),
      activeFilter: this.activeFilter(),
      inStock: this.inStockFilterEnabled() ? this.inStockOnly() : null,
    });
  }

  onSearch(): void {
    this.emitFilters();
  }

  onReset(): void {
    this.name.set('');
    this.activeFilter.set('all');
    this.inStockOnly.set(false);
    this.inStockFilterEnabled.set(false);
    this.emitFilters();
  }

  onInStockToggle(enabled: boolean): void {
    this.inStockFilterEnabled.set(enabled);
    if (!enabled) {
      this.inStockOnly.set(false);
    }
    this.emitFilters();
  }
}
