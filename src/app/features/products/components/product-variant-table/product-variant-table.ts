import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ProductVariantRequest } from '../../../../core/models/products/product-request.models';

type VariantRow = ProductVariantRequest & { id?: number };

function isVariantValid(variant: VariantRow): boolean {
  return !!(
    variant.sku.trim() &&
    variant.size.trim() &&
    variant.color.trim() &&
    variant.price >= 0 &&
    variant.stockQuantity >= 0
  );
}

function createEmptyVariant(): VariantRow {
  return { sku: '', price: 0, stockQuantity: 0, size: '', color: '' };
}

@Component({
  selector: 'app-product-variant-table',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
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
  validChange = output<boolean>();
  saveVariant = output<VariantRow>();
  deleteVariants = output<number[]>();

  canRemove = computed(() => this.variants().length > 1);
  isValid = computed(
    () => this.variants().length >= 1 && this.variants().every(isVariantValid),
  );

  onAddRow(): void {
    this.variantsChange.emit([...this.variants(), createEmptyVariant()]);
    this.emitValid();
  }

  onRemoveRow(index: number): void {
    if (!this.canRemove()) {
      return;
    }
    this.variantsChange.emit(this.variants().filter((_, i) => i !== index));
    this.emitValid();
  }

  updateVariant(index: number, patch: Partial<VariantRow>): void {
    this.variantsChange.emit(
      this.variants().map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    );
    this.emitValid();
  }

  onSaveVariant(variant: VariantRow): void {
    if (isVariantValid(variant)) {
      this.saveVariant.emit(variant);
    }
  }

  variantInvalid(variant: VariantRow): boolean {
    return this.showValidation() && !isVariantValid(variant);
  }

  private emitValid(): void {
    this.validChange.emit(this.isValid());
  }
}
