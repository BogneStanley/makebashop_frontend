import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface ImageLightboxItem {
  url: string;
  name: string;
}

@Component({
  selector: 'app-image-lightbox',
  imports: [ButtonModule, DecimalPipe],
  templateUrl: './image-lightbox.html',
  styleUrl: './image-lightbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLightbox {
  visible = input(false);
  images = input<ImageLightboxItem[]>([]);
  activeIndex = input(0);

  visibleChange = output<boolean>();
  activeIndexChange = output<number>();

  zoom = signal(1);
  panX = signal(0);
  panY = signal(0);

  private panning = false;
  private panStartX = 0;
  private panStartY = 0;
  private panOriginX = 0;
  private panOriginY = 0;

  readonly minZoom = 1;
  readonly maxZoom = 4;
  readonly zoomStep = 0.25;

  currentImage = computed(() => {
    const items = this.images();
    const index = this.activeIndex();
    return items[index] ?? null;
  });

  canNavigate = computed(() => this.images().length > 1);

  imageTransform = computed(
    () => `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`,
  );

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visible()) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
      case '0':
        this.resetZoom();
        break;
    }
  }

  open(index: number): void {
    this.activeIndexChange.emit(index);
    this.resetView();
    this.visibleChange.emit(true);
  }

  close(): void {
    this.visibleChange.emit(false);
    this.resetView();
  }

  previous(): void {
    if (!this.canNavigate()) {
      return;
    }
    const nextIndex = (this.activeIndex() - 1 + this.images().length) % this.images().length;
    this.activeIndexChange.emit(nextIndex);
    this.resetView();
  }

  next(): void {
    if (!this.canNavigate()) {
      return;
    }
    const nextIndex = (this.activeIndex() + 1) % this.images().length;
    this.activeIndexChange.emit(nextIndex);
    this.resetView();
  }

  zoomIn(): void {
    this.setZoom(this.zoom() + this.zoomStep);
  }

  zoomOut(): void {
    this.setZoom(this.zoom() - this.zoomStep);
  }

  resetZoom(): void {
    this.zoom.set(this.minZoom);
    this.panX.set(0);
    this.panY.set(0);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    this.setZoom(this.zoom() + delta);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.zoom() <= 1) {
      return;
    }
    this.panning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panOriginX = this.panX();
    this.panOriginY = this.panY();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.panning) {
      return;
    }
    this.panX.set(this.panOriginX + event.clientX - this.panStartX);
    this.panY.set(this.panOriginY + event.clientY - this.panStartY);
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.panning) {
      return;
    }
    this.panning = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  private setZoom(value: number): void {
    const next = Math.min(this.maxZoom, Math.max(this.minZoom, value));
    this.zoom.set(next);
    if (next === this.minZoom) {
      this.panX.set(0);
      this.panY.set(0);
    }
  }

  private resetView(): void {
    this.zoom.set(this.minZoom);
    this.panX.set(0);
    this.panY.set(0);
    this.panning = false;
  }
}
