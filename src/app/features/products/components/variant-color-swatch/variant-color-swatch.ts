import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { normalizeHexColor } from '../product-variant-table/variant-fields';

@Component({
  selector: 'app-variant-color-swatch',
  templateUrl: './variant-color-swatch.html',
  styleUrl: './variant-color-swatch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantColorSwatch {
  color = input('');

  hexColor = computed(() => normalizeHexColor(this.color()));
}
