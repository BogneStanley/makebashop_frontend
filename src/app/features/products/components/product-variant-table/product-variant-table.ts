import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Menu, MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog';
import {
  ProductVariantDrawer,
  VariantDrawerMode,
} from '../product-variant-drawer/product-variant-drawer';
import {
  isVariantValid,
  VARIANT_FIELDS,
  VariantRow,
} from './variant-fields';

@Component({
  selector: 'app-product-variant-table',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    MenuModule,
    MessageModule,
    ProductVariantDrawer,
    ConfirmDialog,
  ],
  templateUrl: './product-variant-table.html',
  styleUrl: './product-variant-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariantTable {
  variants = input.required<VariantRow[]>();
  disabled = input(false);
  editMode = input(false);
  showValidation = input(false);

  variantsChange = output<VariantRow[]>();
  deleteVariants = output<number[]>();

  actionMenu = viewChild.required<Menu>('actionMenu');

  drawerVisible = signal(false);
  drawerMode = signal<VariantDrawerMode>('create-group');
  editingIndex = signal<number | null>(null);
  editingVariant = signal<VariantRow | null>(null);
  bulkIndices = signal<number[]>([]);

  selectedIndices = signal<Set<number>>(new Set());
  menuItems: MenuItem[] = [];

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);

  canRemove = computed(() => this.variants().length > 1);
  allSelected = computed(
    () =>
      this.variants().length > 0 && this.selectedIndices().size === this.variants().length,
  );
  selectionCount = computed(() => this.selectedIndices().size);
  canBulkDelete = computed(() => {
    const selected = this.selectionCount();
    return selected > 0 && this.variants().length - selected >= 1;
  });
  isValid = computed(
    () => this.variants().length >= 1 && this.variants().every(isVariantValid),
  );

  openCreateGroup(): void {
    this.editingIndex.set(null);
    this.editingVariant.set(null);
    this.bulkIndices.set([]);
    this.drawerMode.set('create-group');
    this.drawerVisible.set(true);
  }

  openBulkEdit(): void {
    if (this.selectionCount() === 0) {
      return;
    }
    this.editingIndex.set(null);
    this.editingVariant.set(null);
    this.bulkIndices.set([...this.selectedIndices()]);
    this.drawerMode.set('edit-bulk');
    this.drawerVisible.set(true);
  }

  openEditVariant(index: number): void {
    this.editingIndex.set(index);
    this.editingVariant.set(this.variants()[index]);
    this.bulkIndices.set([]);
    this.drawerMode.set('edit-single');
    this.drawerVisible.set(true);
  }

  openRowMenu(event: Event, index: number): void {
    const variant = this.variants()[index];
    this.menuItems = [
      {
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => this.openEditVariant(index),
      },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.removeVariant(index, variant),
      },
    ];
    this.actionMenu().toggle(event);
  }

  onCreateGroup(newVariants: VariantRow[]): void {
    this.variantsChange.emit([...this.variants(), ...newVariants]);
    this.drawerVisible.set(false);
  }

  onSaveVariant(variant: VariantRow): void {
    const index = this.editingIndex();
    if (index === null) {
      return;
    }
    this.variantsChange.emit(
      this.variants().map((current, i) =>
        i === index ? { ...variant, id: current.id } : current,
      ),
    );
    this.drawerVisible.set(false);
  }

  onBulkUpdate(event: { indices: number[]; patch: Partial<VariantRow> }): void {
    this.variantsChange.emit(
      this.variants().map((variant, index) =>
        event.indices.includes(index) ? { ...variant, ...event.patch } : variant,
      ),
    );
    this.drawerVisible.set(false);
    this.selectedIndices.set(new Set());
  }

  requestDeleteSelected(): void {
    if (!this.canBulkDelete()) {
      return;
    }
    this.confirmData.set({
      title: 'Supprimer les variantes',
      message: `Supprimer ${this.selectionCount()} variante(s) sélectionnée(s) ?`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmDeleteSelected(): void {
    const indices = [...this.selectedIndices()].sort((a, b) => b - a);

    this.variantsChange.emit(this.variants().filter((_, index) => !indices.includes(index)));
    this.selectedIndices.set(new Set());
    this.confirmVisible.set(false);
  }

  removeVariant(index: number, variant: VariantRow): void {
    if (!this.canRemove()) {
      return;
    }
    if (this.editMode() && variant.id) {
      this.deleteVariants.emit([variant.id]);
    } else {
      this.variantsChange.emit(this.variants().filter((_, i) => i !== index));
    }
    this.rebuildSelectionAfterRemove(index);
  }

  toggleRow(index: number, selected: boolean): void {
    const next = new Set(this.selectedIndices());
    if (selected) {
      next.add(index);
    } else {
      next.delete(index);
    }
    this.selectedIndices.set(next);
  }

  toggleAll(selected: boolean): void {
    if (selected) {
      this.selectedIndices.set(new Set(this.variants().map((_, index) => index)));
    } else {
      this.selectedIndices.set(new Set());
    }
  }

  isRowSelected(index: number): boolean {
    return this.selectedIndices().has(index);
  }

  variantInvalid(variant: VariantRow): boolean {
    return this.showValidation() && !isVariantValid(variant);
  }

  fieldLabel(key: keyof VariantRow): string {
    return VARIANT_FIELDS.find((f) => f.key === key)?.label ?? String(key);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR').format(price);
  }

  private rebuildSelectionAfterRemove(removedIndex: number): void {
    const next = new Set<number>();
    for (const index of this.selectedIndices()) {
      if (index < removedIndex) {
        next.add(index);
      } else if (index > removedIndex) {
        next.add(index - 1);
      }
    }
    this.selectedIndices.set(next);
  }
}
