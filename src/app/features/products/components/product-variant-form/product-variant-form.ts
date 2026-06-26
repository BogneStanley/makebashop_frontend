import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProductVariantRequest } from '../../../../core/models/products/product-request.models';

type VariantRow = ProductVariantRequest & { id?: number };

@Component({
  selector: 'app-product-variant-form',
  imports: [
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
  ],
  templateUrl: './product-variant-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariantForm {
  private fb = inject(FormBuilder);

  visible = input(false);
  variant = input<VariantRow | null>(null);

  visibleChange = output<boolean>();
  save = output<VariantRow>();

  form = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.pattern(/\S+/)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    size: ['', [Validators.required, Validators.pattern(/\S+/)]],
    color: ['', [Validators.required, Validators.pattern(/\S+/)]],
  });

  constructor() {
    effect(() => {
      const current = this.variant();
      if (current) {
        this.form.reset({
          sku: current.sku,
          price: current.price,
          stockQuantity: current.stockQuantity,
          size: current.size,
          color: current.color,
        });
      }
    });
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.save.emit({ ...this.variant(), ...this.form.getRawValue() });
    this.close();
  }
}
