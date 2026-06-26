import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { UpdateImagePositionRequest } from '../../../core/models/products/product-request.models';
import {
  ProductImageResponse,
  ProductResponse,
} from '../../../core/models/products/product-response.models';
import { getMockProductById, mockCategories } from '../../../core/models/products/product.mock';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { ProductEditHeader } from '../components/product-edit-header/product-edit-header';
import { ProductGeneralForm } from '../components/product-general-form/product-general-form';
import { ProductImageGallery } from '../components/product-image-gallery/product-image-gallery';
import { ProductVariantTable } from '../components/product-variant-table/product-variant-table';
import { isVariantValid } from '../components/product-variant-table/variant-fields';

@Component({
  selector: 'app-product-edit-page',
  imports: [
    ButtonModule,
    TabsModule,
    MessageModule,
    ProductEditHeader,
    ProductGeneralForm,
    ProductVariantTable,
    ProductImageGallery,
    ConfirmDialog,
  ],
  templateUrl: './product-edit.page.html',
  styleUrl: './product-edit.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  categories = mockCategories;

  product = signal<ProductResponse | null>(null);
  activeTab = signal<'general' | 'variants' | 'images'>('general');
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  general = signal({
    name: '',
    description: '',
    isActive: true,
    categoryIds: [] as number[],
  });

  variants = signal<
    { id?: number; sku: string; price: number; stockQuantity: number; size: string; color: string }[]
  >([]);

  images = signal<(ProductImageResponse & { file?: File })[]>([]);

  showGeneralValidation = signal(false);
  showVariantsValidation = signal(false);

  generalFormValid = signal(false);
  variantsValid = computed(
    () => this.variants().length >= 1 && this.variants().every(isVariantValid),
  );

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  confirmAction = signal<'delete-product' | 'delete-variants' | null>(null);
  private pendingVariantIds = signal<number[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    setTimeout(() => {
      const loaded = getMockProductById(id);
      if (!loaded) {
        this.error.set('Produit introuvable.');
        this.loading.set(false);
        return;
      }

      this.product.set({ ...loaded });
      this.general.set({
        name: loaded.name,
        description: loaded.description,
        isActive: loaded.isActive,
        categoryIds: loaded.categories.map((c) => c.id),
      });
      this.variants.set(
        loaded.productVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price.amount,
          stockQuantity: v.stockQuantity,
          size: v.size,
          color: v.color,
        })),
      );
      this.images.set(loaded.images.map((image) => ({ ...image })));
      this.loading.set(false);
    }, 400);
  }

  onTabChange(value: string | number | undefined): void {
    if (value === 'general' || value === 'variants' || value === 'images') {
      this.activeTab.set(value);
    }
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
    this.notifications.info('Ordre des images mis à jour (mock).');
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

  onDeleteVariants(variantIds: number[]): void {
    if (this.variants().length <= variantIds.length) {
      this.notifications.error('Impossible de supprimer la dernière variante.');
      return;
    }
    this.pendingVariantIds.set(variantIds);
    this.confirmAction.set('delete-variants');
    this.confirmData.set({
      title: 'Supprimer la variante',
      message: 'Êtes-vous sûr de vouloir supprimer cette variante ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  onSetPrimary(imageId: number): void {
    this.images.update((items) =>
      items.map((image) => ({ ...image, isPrimary: image.id === imageId })),
    );
  }

  onDeleteImages(imageIds: number[]): void {
    this.images.update((items) => items.filter((image) => !imageIds.includes(image.id)));
  }

  saveVariants(): void {
    this.showVariantsValidation.set(true);
    if (!this.variantsValid()) {
      this.notifications.error('Veuillez corriger les erreurs des variantes.');
      return;
    }

    this.saving.set(true);
    console.log('variants (mock)', this.variants());

    setTimeout(() => {
      this.saving.set(false);
      this.showVariantsValidation.set(false);
      this.notifications.success('Variantes enregistrées (mock).');
    }, 400);
  }

  activate(): void {
    this.general.update((g) => ({ ...g, isActive: true }));
    this.product.update((p) => (p ? { ...p, isActive: true } : p));
  }

  deactivate(): void {
    this.general.update((g) => ({ ...g, isActive: false }));
    this.product.update((p) => (p ? { ...p, isActive: false } : p));
  }

  requestDeleteProduct(): void {
    this.confirmAction.set('delete-product');
    this.confirmData.set({
      title: 'Supprimer le produit',
      message: 'Supprimer définitivement ce produit ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  saveGeneral(): void {
    this.showGeneralValidation.set(true);
    if (!this.generalFormValid()) {
      this.notifications.error('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    this.saving.set(true);
    console.log('UpdateProductRequest (mock)', this.general());

    setTimeout(() => {
      const g = this.general();
      this.product.update((current) =>
        current
          ? {
              ...current,
              name: g.name,
              description: g.description,
              isActive: g.isActive,
              categories: this.categories.filter((c) => g.categoryIds.includes(c.id)),
            }
          : current,
      );
      this.saving.set(false);
      this.showGeneralValidation.set(false);
      this.notifications.success('Produit enregistré (mock).');
    }, 400);
  }

  confirmActionHandler(): void {
    if (this.confirmAction() === 'delete-product') {
      this.notifications.success('Produit supprimé (mock).');
      this.router.navigate(['/manage/products']);
    }
    if (this.confirmAction() === 'delete-variants') {
      const ids = this.pendingVariantIds();
      this.variants.update((items) => items.filter((v) => !v.id || !ids.includes(v.id)));
      this.notifications.success('Variante supprimée (mock).');
    }
    this.confirmAction.set(null);
    this.pendingVariantIds.set([]);
    this.confirmVisible.set(false);
  }

  back(): void {
    this.router.navigate(['/manage/products']);
  }
}
