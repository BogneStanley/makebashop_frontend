import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProductImageResponse } from '../../../../core/models/products/product-response.models';
import { UpdateImagePositionRequest } from '../../../../core/models/products/product-request.models';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog';

type GalleryImage = ProductImageResponse & { file?: File };

@Component({
  selector: 'app-product-image-gallery',
  imports: [ButtonModule, TagModule, ConfirmDialog],
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

  draggedIndex = signal<number | null>(null);
  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingDeleteIds: number[] = [];

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) {
      this.upload.emit(files);
    }
    input.value = '';
  }

  onDragStart(index: number): void {
    if (!this.disabled()) {
      this.draggedIndex.set(index);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(targetIndex: number): void {
    const sourceIndex = this.draggedIndex();
    this.draggedIndex.set(null);
    if (sourceIndex === null || sourceIndex === targetIndex) {
      return;
    }

    const items = [...this.images()];
    const [moved] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, moved);

    this.reorder.emit(
      items.map((image, index) => ({ imageId: image.id, position: index })),
    );
  }

  onSetPrimary(imageId: number): void {
    this.setPrimary.emit(imageId);
  }

  openDeleteDialog(imageId: number): void {
    this.pendingDeleteIds = [imageId];
    this.confirmData.set({
      title: 'Supprimer l\'image',
      message: 'Êtes-vous sûr de vouloir supprimer cette image ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmDelete(): void {
    this.deleteImages.emit(this.pendingDeleteIds);
    this.pendingDeleteIds = [];
    this.confirmVisible.set(false);
  }
}
