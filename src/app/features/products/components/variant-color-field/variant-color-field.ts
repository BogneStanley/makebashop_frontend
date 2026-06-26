import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DEFAULT_VARIANT_COLOR,
  normalizeHexColor,
} from '../product-variant-table/variant-fields';

@Component({
  selector: 'app-variant-color-field',
  imports: [FormsModule],
  templateUrl: './variant-color-field.html',
  styleUrl: './variant-color-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantColorField {
  value = input<string | number>('');
  disabled = input(false);
  invalid = input(false);

  valueChange = output<string>();

  pickerValue = computed(() => normalizeHexColor(this.value()) ?? DEFAULT_VARIANT_COLOR);

  onPickerChange(raw: string): void {
    this.valueChange.emit(normalizeHexColor(raw) ?? DEFAULT_VARIANT_COLOR);
  }
}
