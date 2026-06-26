import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CategoryResponse } from '../../../../core/models/products/product-response.models';

@Component({
  selector: 'app-product-general-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    MultiSelectModule,
    ToggleSwitchModule,
  ],
  templateUrl: './product-general-form.html',
  styleUrl: './product-general-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGeneralForm {
  private fb = inject(FormBuilder);

  value = input.required<{
    name: string;
    description: string;
    isActive?: boolean;
    categoryIds: number[];
  }>();
  categories = input.required<CategoryResponse[]>();
  showIsActive = input(false);
  showValidation = input(false);
  disabled = input(false);

  valueChange = output<{
    name: string;
    description: string;
    isActive: boolean;
    categoryIds: number[];
  }>();
  validityChange = output<boolean>();

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S+/)]],
    description: ['', [Validators.required, Validators.pattern(/\S+/)]],
    isActive: [true],
    categoryIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
  });

  constructor() {
    effect(() => {
      const current = this.value();
      this.form.patchValue(
        {
          name: current.name,
          description: current.description,
          categoryIds: [...current.categoryIds],
          isActive: current.isActive ?? true,
        },
        { emitEvent: false },
      );

      if (this.disabled()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }

      this.validityChange.emit(this.form.valid);
    });

    this.form.statusChanges.subscribe(() => {
      this.validityChange.emit(this.form.valid);
    });

    this.form.valueChanges.subscribe(() => {
      this.valueChange.emit(this.form.getRawValue());
    });
  }

  get nameControl() {
    return this.form.controls.name;
  }

  get descriptionControl() {
    return this.form.controls.description;
  }

  get categoryIdsControl() {
    return this.form.controls.categoryIds;
  }
}
