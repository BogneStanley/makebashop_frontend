import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  emptyFieldValues,
  emptyVariant,
  isColorField,
  isNumericField,
  isVariantValid,
  mergeVariant,
  normalizeHexColor,
  VARIANT_FIELDS,
  VariantField,
  VariantRow,
} from '../product-variant-table/variant-fields';
import { VariantColorField } from '../variant-color-field/variant-color-field';

export type VariantDrawerMode = 'create-group' | 'edit-single' | 'edit-bulk';

@Component({
  selector: 'app-product-variant-drawer',
  imports: [
    FormsModule,
    DrawerModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    VariantColorField,
  ],
  templateUrl: './product-variant-drawer.html',
  styleUrl: './product-variant-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariantDrawer {
  readonly fields = VARIANT_FIELDS;

  visible = input(false);
  mode = input<VariantDrawerMode>('create-group');
  variant = input<VariantRow | null>(null);
  disabled = input(false);

  visibleChange = output<boolean>();
  createGroup = output<VariantRow[]>();
  saveVariant = output<VariantRow>();
  bulkUpdate = output<{ indices: number[]; patch: Partial<VariantRow> }>();

  bulkIndices = input<number[]>([]);

  showValidation = signal(false);

  groupFields = signal<VariantField[]>([]);
  groupValues = signal<Record<VariantField, string | number>>(emptyFieldValues());
  groupRows = signal<Record<VariantField, string | number>[]>([emptyFieldValues()]);

  editValues = signal<Record<VariantField, string | number>>(emptyFieldValues());
  bulkEditFields = signal<VariantField[]>([]);
  bulkEditValues = signal<Record<VariantField, string | number>>(emptyFieldValues());

  individualFields = computed(() =>
    VARIANT_FIELDS.map((f) => f.key).filter((key) => !this.groupFields().includes(key)),
  );

  drawerTitle = computed(() => {
    switch (this.mode()) {
      case 'create-group':
        return 'Nouveau groupe de variantes';
      case 'edit-single':
        return 'Modifier la variante';
      case 'edit-bulk':
        return `Modifier la sélection (${this.bulkIndices().length})`;
    }
  });

  isNumericField = isNumericField;
  isColorField = isColorField;
  normalizeHexColor = normalizeHexColor;

  constructor() {
    effect(() => {
      if (this.visible() && this.mode() === 'create-group') {
        this.showValidation.set(false);
        this.groupFields.set([]);
        this.groupValues.set(emptyFieldValues());
        this.groupRows.set([emptyFieldValues()]);
        this.bulkEditFields.set([]);
        this.bulkEditValues.set(emptyFieldValues());
      }

      const variant = this.variant();
      if (this.visible() && this.mode() === 'edit-single' && variant) {
        this.showValidation.set(false);
        this.editValues.set({
          sku: variant.sku,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          size: variant.size,
          color: variant.color,
        });
      }

      if (this.visible() && this.mode() === 'edit-bulk') {
        this.showValidation.set(false);
        this.bulkEditFields.set([]);
        this.bulkEditValues.set(emptyFieldValues());
      }
    });
  }

  close(): void {
    this.visibleChange.emit(false);
    this.reset();
  }

  toggleGroupField(field: VariantField, checked: boolean): void {
    const next = checked
      ? [...this.groupFields(), field]
      : this.groupFields().filter((f) => f !== field);
    this.groupFields.set(next);
    this.groupRows.set([emptyFieldValues()]);
  }

  toggleBulkField(field: VariantField, checked: boolean): void {
    const next = checked
      ? [...this.bulkEditFields(), field]
      : this.bulkEditFields().filter((f) => f !== field);
    this.bulkEditFields.set(next);
  }

  isGroupField(field: VariantField): boolean {
    return this.groupFields().includes(field);
  }

  isBulkField(field: VariantField): boolean {
    return this.bulkEditFields().includes(field);
  }

  addGroupRow(): void {
    this.groupRows.update((rows) => [...rows, emptyFieldValues()]);
  }

  removeGroupRow(index: number): void {
    if (this.groupRows().length <= 1) {
      return;
    }
    this.groupRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateGroupValue(field: VariantField, value: string | number): void {
    this.groupValues.update((v) => ({ ...v, [field]: value }));
  }

  updateGroupRow(index: number, field: VariantField, value: string | number): void {
    this.groupRows.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  updateEditValue(field: VariantField, value: string | number): void {
    this.editValues.update((v) => ({ ...v, [field]: value }));
  }

  updateBulkValue(field: VariantField, value: string | number): void {
    this.bulkEditValues.update((v) => ({ ...v, [field]: value }));
  }

  fieldLabel(field: VariantField): string {
    return VARIANT_FIELDS.find((f) => f.key === field)?.label ?? field;
  }

  submit(): void {
    this.showValidation.set(true);

    if (this.mode() === 'create-group') {
      this.submitCreateGroup();
    } else if (this.mode() === 'edit-single') {
      this.submitEditSingle();
    } else {
      this.submitBulkEdit();
    }
  }

  private submitCreateGroup(): void {
    if (this.groupFields().length === 0) {
      return;
    }

    const sharedInvalid = this.groupFields().some((field) => {
      const value = this.groupValues()[field];
      if (isNumericField(field)) {
        return value === null || value === undefined || Number(value) < 0;
      }
      if (isColorField(field)) {
        return !normalizeHexColor(value);
      }
      return !String(value).trim();
    });

    if (sharedInvalid) {
      return;
    }

    const shared = Object.fromEntries(
      this.groupFields().map((field) => [field, this.groupValues()[field]]),
    );

    const rows =
      this.individualFields().length === 0
        ? [emptyFieldValues()]
        : this.groupRows();

    const variants = rows.map((row) => {
      const individual = Object.fromEntries(
        this.individualFields().map((field) => [field, row[field]]),
      );
      return mergeVariant(shared, individual);
    });

    if (!variants.every(isVariantValid)) {
      return;
    }

    this.createGroup.emit(variants);
    this.close();
  }

  private submitEditSingle(): void {
    const values = this.editValues();
    const variant: VariantRow = {
      ...this.variant(),
      sku: String(values.sku).trim(),
      price: Number(values.price) || 0,
      stockQuantity: Number(values.stockQuantity) || 0,
      size: String(values.size).trim(),
      color: normalizeHexColor(values.color) ?? '',
    };

    if (!isVariantValid(variant)) {
      return;
    }

    this.saveVariant.emit(variant);
    this.close();
  }

  private submitBulkEdit(): void {
    if (this.bulkEditFields().length === 0) {
      return;
    }

    const patch: Partial<VariantRow> = {};
    for (const field of this.bulkEditFields()) {
      const value = this.bulkEditValues()[field];
      if (field === 'price' || field === 'stockQuantity') {
        patch[field] = Number(value) || 0;
      } else if (isColorField(field)) {
        patch[field] = normalizeHexColor(value) ?? '';
      } else {
        patch[field] = String(value).trim();
      }
    }

    const hasEmptyText = this.bulkEditFields().some((field) => {
      if (isNumericField(field)) {
        return (patch[field] as number) < 0;
      }
      if (isColorField(field)) {
        return !normalizeHexColor(patch[field]);
      }
      return !String(patch[field]).trim();
    });

    if (hasEmptyText) {
      return;
    }

    this.bulkUpdate.emit({ indices: this.bulkIndices(), patch });
    this.close();
  }

  private reset(): void {
    this.showValidation.set(false);
    this.groupFields.set([]);
    this.groupValues.set(emptyFieldValues());
    this.groupRows.set([emptyFieldValues()]);
    this.editValues.set(emptyFieldValues());
    this.bulkEditFields.set([]);
    this.bulkEditValues.set(emptyFieldValues());
  }
}
