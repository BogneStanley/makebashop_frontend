import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-image-uploader',
  imports: [ButtonModule],
  templateUrl: './product-image-uploader.html',
  styleUrl: './product-image-uploader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImageUploader {
  files = input.required<File[]>();
  previews = input.required<string[]>();
  maxFiles = input(10);
  disabled = input(false);

  filesChange = output<File[]>();
  removeFile = output<number>();

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    if (!selected.length) {
      return;
    }

    const remaining = this.maxFiles() - this.files().length;
    const nextFiles = [...this.files(), ...selected.slice(0, Math.max(0, remaining))];
    this.filesChange.emit(nextFiles);
    input.value = '';
  }

  onRemove(index: number): void {
    this.removeFile.emit(index);
  }
}
