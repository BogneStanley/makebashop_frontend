import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ProductImageResponse } from '../../../../core/models/products/product-response.models';
import { UpdateImagePositionRequest } from '../../../../core/models/products/product-request.models';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog';
import { ImageLightbox, ImageLightboxItem } from '../../../../shared/image-lightbox/image-lightbox';

type GalleryImage = ProductImageResponse & { file?: File };

@Component({
  selector: 'app-product-image-gallery',
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    TagModule,
    ConfirmDialog,
    ImageLightbox,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
  templateUrl: './product-image-gallery.html',
  styleUrl: './product-image-gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImageGallery {
  images = input.required<GalleryImage[]>();
  disabled = input(false);

  setPrimary = output<number>();
  deleteImages = output<number[]>();
  reorder = output<UpdateImagePositionRequest[]>();
  upload = output<File[]>();

  selectedIds = signal<Set<number>>(new Set());
  viewerOpen = signal(false);
  viewerIndex = signal(0);

  viewerImages = computed((): ImageLightboxItem[] =>
    this.images()
      .filter((image) => !!image.url)
      .map((image) => ({ url: image.url, name: image.name })),
  );

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingDeleteIds: number[] = [];

  selectionCount = computed(() => this.selectedIds().size);

  allSelected = computed(() => {
    const ids = this.images()
      .map((image) => image.id)
      .filter((id): id is number => id !== undefined);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  });

  canBulkSetPrimary = computed(() => this.selectionCount() === 1);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) {
      this.upload.emit(files);
    }
    input.value = '';
  }

  onDrop(event: CdkDragDrop<GalleryImage[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const items = [...this.images()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);

    this.reorder.emit(
      items.map((image, index) => ({ imageId: image.id, position: index })),
    );
  }

  openViewer(index: number): void {
    const image = this.images()[index];
    if (!image?.url) {
      return;
    }
    const viewerIndex = this.viewerImages().findIndex(
      (item) => item.url === image.url && item.name === image.name,
    );
    if (viewerIndex === -1) {
      return;
    }
    this.viewerIndex.set(viewerIndex);
    this.viewerOpen.set(true);
  }

  onViewerIndexChange(index: number): void {
    this.viewerIndex.set(index);
  }

  isSelected(imageId: number | undefined): boolean {
    return imageId !== undefined && this.selectedIds().has(imageId);
  }

  toggleSelection(imageId: number | undefined, selected: boolean): void {
    if (imageId === undefined) {
      return;
    }
    const next = new Set(this.selectedIds());
    if (selected) {
      next.add(imageId);
    } else {
      next.delete(imageId);
    }
    this.selectedIds.set(next);
  }

  toggleAll(selected: boolean): void {
    if (selected) {
      const ids = this.images()
        .map((image) => image.id)
        .filter((id): id is number => id !== undefined);
      this.selectedIds.set(new Set(ids));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  bulkSetPrimary(): void {
    const [imageId] = [...this.selectedIds()];
    if (imageId !== undefined) {
      this.setPrimary.emit(imageId);
      this.selectedIds.set(new Set());
    }
  }

  openBulkDeleteDialog(): void {
    const count = this.selectionCount();
    if (count === 0) {
      return;
    }
    this.pendingDeleteIds = [...this.selectedIds()];
    this.confirmData.set({
      title: 'Supprimer les images',
      message: `Supprimer ${count} image(s) sélectionnée(s) ?`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmDelete(): void {
    this.deleteImages.emit(this.pendingDeleteIds);
    this.pendingDeleteIds = [];
    this.selectedIds.set(new Set());
    this.confirmVisible.set(false);
  }
}
