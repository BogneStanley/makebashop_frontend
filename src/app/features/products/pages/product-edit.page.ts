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
import { Observable, concatMap, finalize, from, last } from 'rxjs';
import {
  ProductVariantRequest,
  UpdateImagePositionRequest,
} from '../../../core/models/products/product-request.models';
import {
  ProductImageResponse,
  ProductResponse,
  ProductVariantResponse,
} from '../../../core/models/products/product-response.models';
import { CategoryService } from '../../../core/services/category.service';
import { ManagedProductService } from '../../../core/services/managed-product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { ProductEditHeader } from '../components/product-edit-header/product-edit-header';
import { ProductGeneralForm } from '../components/product-general-form/product-general-form';
import { ProductImageGallery } from '../components/product-image-gallery/product-image-gallery';
import { ProductVariantTable } from '../components/product-variant-table/product-variant-table';
import { isVariantValid } from '../components/product-variant-table/variant-fields';

type VariantRow = {
  id?: number;
  sku: string;
  price: number;
  stockQuantity: number;
  size: string;
  color: string;
};

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
  private categoryService = inject(CategoryService);
  private managedProductService = inject(ManagedProductService);

  categories = this.categoryService.categoriesList;

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

  variants = signal<VariantRow[]>([]);
  private originalVariants = signal<VariantRow[]>([]);

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
    this.categoryService.loadCategories().subscribe();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    const stateProduct = history.state?.['product'] as ProductResponse | undefined;

    if (stateProduct?.id === id) {
      this.applyProduct(stateProduct);
      this.loading.set(false);
      return;
    }

    this.managedProductService
      .getManagedProductById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((loaded) => {
        if (!loaded) {
          this.error.set('Produit introuvable.');
          return;
        }
        this.applyProduct(loaded);
      });
  }

  onTabChange(value: string | number | undefined): void {
    if (value === 'general' || value === 'variants' || value === 'images') {
      this.activeTab.set(value);
    }
  }

  onImagesReorder(positions: UpdateImagePositionRequest[]): void {
    const productId = this.product()?.id;
    if (!productId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.managedProductService
      .updateImagePositions(productId, { imagesPosition: positions })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.notifications.success('Ordre des images mis à jour.');
        }
      });
  }

  onUploadImages(files: File[]): void {
    const productId = this.product()?.id;
    if (!productId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.managedProductService
      .addImages(productId, files)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.notifications.success('Images ajoutées.');
        }
      });
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
    const productId = this.product()?.id;
    if (!productId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.managedProductService
      .setPrimaryImage(productId, imageId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.notifications.success('Image principale mise à jour.');
        }
      });
  }

  onDeleteImages(imageIds: number[]): void {
    const productId = this.product()?.id;
    if (!productId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.managedProductService
      .deleteImages(productId, imageIds)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.notifications.success('Images supprimées.');
        }
      });
  }

  saveVariants(): void {
    this.showVariantsValidation.set(true);
    if (!this.variantsValid()) {
      this.notifications.error('Veuillez corriger les erreurs des variantes.');
      return;
    }

    const productId = this.product()?.id;
    if (!productId) {
      return;
    }

    const operations: Observable<ProductResponse | null>[] = [];
    const newVariants = this.variants()
      .filter((variant) => !variant.id)
      .map((variant) => toVariantRequest(variant));

    if (newVariants.length > 0) {
      operations.push(this.managedProductService.addVariants(productId, newVariants));
    }

    for (const variant of this.variants()) {
      if (!variant.id) {
        continue;
      }
      const original = this.originalVariants().find((item) => item.id === variant.id);
      if (original && variantChanged(original, variant)) {
        operations.push(
          this.managedProductService.updateVariant(
            productId,
            variant.id,
            toVariantRequest(variant),
          ),
        );
      }
    }

    if (operations.length === 0) {
      this.notifications.info('Aucune modification à enregistrer.');
      return;
    }

    this.saving.set(true);
    from(operations)
      .pipe(
        concatMap((operation) => operation),
        last(),
        finalize(() => this.saving.set(false)),
      )
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.showVariantsValidation.set(false);
          this.notifications.success('Variantes enregistrées.');
        }
      });
  }

  activate(): void {
    const productId = this.product()?.id;
    if (!productId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.managedProductService
      .activateProduct(productId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.notifications.success('Produit activé.');
        }
      });
  }

  deactivate(): void {
    const productId = this.product()?.id;
    if (!productId || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.managedProductService
      .deactivateProduct(productId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.notifications.info('Produit désactivé.');
        }
      });
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

    const productId = this.product()?.id;
    if (!productId) {
      return;
    }

    const general = this.general();
    this.saving.set(true);
    this.managedProductService
      .updateProduct(productId, {
        name: general.name.trim(),
        description: general.description.trim(),
        isActive: general.isActive,
        categoryIds: general.categoryIds,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((result) => {
        if (result) {
          this.applyProduct(result);
          this.showGeneralValidation.set(false);
          this.notifications.success('Produit enregistré.');
        }
      });
  }

  confirmActionHandler(): void {
    if (this.confirmAction() === 'delete-product') {
      const productId = this.product()?.id;
      if (productId) {
        this.saving.set(true);
        this.managedProductService
          .deleteProduct(productId)
          .pipe(finalize(() => this.saving.set(false)))
          .subscribe((success) => {
            if (success) {
              this.notifications.success('Produit supprimé.');
              this.router.navigate(['/manage/products']);
            }
          });
      }
    }

    if (this.confirmAction() === 'delete-variants') {
      const productId = this.product()?.id;
      const variantIds = this.pendingVariantIds();
      if (productId && variantIds.length > 0) {
        this.saving.set(true);
        this.managedProductService
          .deleteVariants(productId, variantIds)
          .pipe(finalize(() => this.saving.set(false)))
          .subscribe((result) => {
            if (result) {
              this.applyProduct(result);
              this.notifications.success('Variante supprimée.');
            }
          });
      }
    }

    this.confirmAction.set(null);
    this.pendingVariantIds.set([]);
    this.confirmVisible.set(false);
  }

  back(): void {
    this.router.navigate(['/manage/products']);
  }

  private applyProduct(product: ProductResponse): void {
    this.product.set(product);
    this.general.set({
      name: product.name,
      description: product.description,
      isActive: product.isActive,
      categoryIds: product.categories.map((category) => category.id),
    });

    const rows = product.productVariants.map(toVariantRow);
    this.variants.set(rows);
    this.originalVariants.set(rows.map((row) => ({ ...row })));
    this.images.set(product.images.map((image) => ({ ...image })));
  }
}

function toVariantRow(variant: ProductVariantResponse): VariantRow {
  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price.amount,
    stockQuantity: variant.stockQuantity,
    size: variant.size,
    color: variant.color,
  };
}

function toVariantRequest(variant: VariantRow): ProductVariantRequest {
  return {
    sku: variant.sku.trim(),
    price: variant.price,
    stockQuantity: variant.stockQuantity,
    size: variant.size.trim(),
    color: variant.color,
  };
}

function variantChanged(original: VariantRow, current: VariantRow): boolean {
  return (
    original.sku !== current.sku ||
    original.price !== current.price ||
    original.stockQuantity !== current.stockQuantity ||
    original.size !== current.size ||
    original.color !== current.color
  );
}
