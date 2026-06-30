import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  CreateProductRequest,
  UpdateImagePositionRequest,
} from '../../../core/models/products/product-request.models';
import { ProductImageResponse } from '../../../core/models/products/product-response.models';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductGeneralForm } from '../components/product-general-form/product-general-form';
import { ProductImageGallery } from '../components/product-image-gallery/product-image-gallery';
import { ProductVariantTable } from '../components/product-variant-table/product-variant-table';
import { isVariantValid, VariantRow } from '../components/product-variant-table/variant-fields';

@Component({
  selector: 'app-product-create-page',
  imports: [ButtonModule, ProductGeneralForm, ProductVariantTable, ProductImageGallery],
  templateUrl: './product-create.page.html',
  styleUrl: './product-create.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreatePage implements OnInit, OnDestroy {
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private categoryService = inject(CategoryService);

  categories = this.categoryService.categoriesList;

  general = signal({ name: '', description: '', categoryIds: [] as number[] });
  variants = signal<VariantRow[]>([]);
  images = signal<(ProductImageResponse & { file?: File })[]>([]);

  generalFormValid = signal(false);
  variantsValid = computed(
    () => this.variants().length >= 1 && this.variants().every(isVariantValid),
  );

  showValidation = signal(false);
  saving = signal(false);

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe();
  }

  ngOnDestroy(): void {
    for (const image of this.images()) {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
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

  onImagesReorder(positions: UpdateImagePositionRequest[]): void {
    this.images.update((items) => {
      const ordered = [...items].sort((a, b) => {
        const posA = positions.find((p) => p.imageId === a.id)?.position ?? a.position;
        const posB = positions.find((p) => p.imageId === b.id)?.position ?? b.position;
        return posA - posB;
      });
      return ordered.map((image, index) => ({ ...image, position: index }));
    });
  }

  onUploadImages(files: File[]): void {
    const start = this.images().length;
    this.images.update((items) => [
      ...items,
      ...files.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        name: file.name,
        position: start + index,
        isPrimary: items.length === 0 && index === 0,
        file,
      })),
    ]);
  }

  onSetPrimary(imageId: number): void {
    this.images.update((items) =>
      items.map((image) => ({ ...image, isPrimary: image.id === imageId })),
    );
  }

  onDeleteImages(imageIds: number[]): void {
    const toDelete = this.images().filter((image) => imageIds.includes(image.id));
    for (const image of toDelete) {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    }
    this.images.update((items) => {
      const remaining = items.filter((image) => !imageIds.includes(image.id));
      if (remaining.length > 0 && !remaining.some((image) => image.isPrimary)) {
        return remaining.map((image, index) => ({
          ...image,
          isPrimary: index === 0,
        }));
      }
      return remaining;
    });
  }

  cancel(): void {
    this.router.navigate(['/manage/products']);
  }

  save(): void {
    this.showValidation.set(true);

    const generalValid = this.generalFormValid();
    const variantsValid = this.variantsValid();

    if (!generalValid || !variantsValid) {
      this.notifications.error('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    const payload: CreateProductRequest & { imageFiles: File[] } = {
      ...this.general(),
      productVariants: this.variants(),
      imageFiles: this.images()
        .filter((image) => image.file)
        .map((image) => image.file!),
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
