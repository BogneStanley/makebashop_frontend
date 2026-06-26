import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CreateProductRequest } from '../../../core/models/products/product-request.models';
import { mockCategories } from '../../../core/models/products/product.mock';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductGeneralForm } from '../components/product-general-form/product-general-form';
import { ProductImageUploader } from '../components/product-image-uploader/product-image-uploader';
import { ProductVariantTable } from '../components/product-variant-table/product-variant-table';
import { VariantRow } from '../components/product-variant-table/variant-fields';

@Component({
  selector: 'app-product-create-page',
  imports: [ButtonModule, ProductGeneralForm, ProductVariantTable, ProductImageUploader],
  templateUrl: './product-create.page.html',
  styleUrl: './product-create.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreatePage implements OnDestroy {
  private router = inject(Router);
  private notifications = inject(NotificationService);

  categories = mockCategories;
  generalForm = viewChild(ProductGeneralForm);
  variantTable = viewChild(ProductVariantTable);

  general = signal({ name: '', description: '', categoryIds: [] as number[] });
  variants = signal<VariantRow[]>([]);
  imageFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  showValidation = signal(false);
  saving = signal(false);

  ngOnDestroy(): void {
    for (const preview of this.imagePreviews()) {
      URL.revokeObjectURL(preview);
    }
  }

  onGeneralChange(value: {
    name: string;
    description: string;
    isActive: boolean;
    categoryIds: number[];
  }): void {
    this.general.set({
      name: value.name,
      description: value.description,
      categoryIds: value.categoryIds,
    });
  }

  onFilesChange(files: File[]): void {
    for (const preview of this.imagePreviews()) {
      URL.revokeObjectURL(preview);
    }
    this.imageFiles.set(files);
    this.imagePreviews.set(files.map((file) => URL.createObjectURL(file)));
  }

  onRemoveFile(index: number): void {
    URL.revokeObjectURL(this.imagePreviews()[index]);
    this.imageFiles.update((files) => files.filter((_, i) => i !== index));
    this.imagePreviews.update((items) => items.filter((_, i) => i !== index));
  }

  cancel(): void {
    this.router.navigate(['/manage/products']);
  }

  save(): void {
    this.showValidation.set(true);

    const generalValid = this.generalForm()?.validate() ?? false;
    const variantsValid = this.variantTable()?.validate() ?? false;

    if (!generalValid || !variantsValid) {
      this.notifications.error('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    const payload: CreateProductRequest & { imageFiles: File[] } = {
      ...this.general(),
      productVariants: this.variants(),
      imageFiles: this.imageFiles(),
    };

    this.saving.set(true);
    console.log('CreateProductRequest', payload);

    setTimeout(() => {
      this.saving.set(false);
      this.notifications.success('Produit enregistré (mock).');
      this.router.navigate(['/manage/products']);
    }, 500);
  }
}
