import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize, of, switchMap } from 'rxjs';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { Product } from '../../../core/services/product.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import {
  findShopVariant,
  getCheapestVariant,
  getSizesForColor,
} from '../../../core/models/products/shop-product.models';
import { toShopProduct } from '../../../core/utils/map-product-response';

@Component({
  selector: 'app-product-details',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Header,
    Footer,
    ButtonModule,
    InputNumberModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  product = signal<Product | undefined>(undefined);
  loading = signal(true);
  selectedImage = signal<string>('');
  selectedColor = signal<string>('');
  selectedSize = signal<string>('');
  quantity = signal<number>(1);
  activeTab = signal<string>('description');

  availableSizes = computed(() => {
    const prod = this.product();
    if (!prod) {
      return [];
    }

    const variants = prod.variants ?? [];
    if (variants.length === 0) {
      return prod.sizes ?? [];
    }

    const color = this.selectedColor();
    if (prod.colors?.length && color) {
      return getSizesForColor(variants, color);
    }

    return prod.sizes ?? [];
  });

  selectedVariant = computed(() => {
    const prod = this.product();
    const variants = prod?.variants ?? [];

    if (variants.length === 0) {
      return undefined;
    }

    return findShopVariant(variants, this.selectedColor(), this.selectedSize());
  });

  displayPrice = computed(() => this.selectedVariant()?.price ?? this.product()?.price ?? 0);

  variantStock = computed(() => {
    const variant = this.selectedVariant();
    if (variant) {
      return variant.stockQuantity;
    }

    return this.product()?.stock ?? 0;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          const id = idParam ? parseInt(idParam, 10) : NaN;

          this.loading.set(true);
          this.product.set(undefined);
          this.resetSelections();

          if (!idParam || Number.isNaN(id)) {
            this.loading.set(false);
            return of(null);
          }

          return this.catalogService.getProductById(id).pipe(
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        this.applyProduct(toShopProduct(response));
      });
  }

  selectImage(img: string): void {
    this.selectedImage.set(img);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
    this.syncSizeForColor(color);
    this.quantity.set(1);
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
    this.quantity.set(1);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  addToCart(): void {
    const prod = this.product();
    const variant = this.selectedVariant();

    if (!prod || this.variantStock() === 0) {
      return;
    }

    if (!variant) {
      return;
    }

    this.cartService.addToCart(prod.id, variant.id, this.quantity()).subscribe();
  }

  private applyProduct(prod: Product): void {
    this.product.set(prod);
    this.selectedImage.set(prod.image);
    this.quantity.set(1);

    const cheapest = getCheapestVariant(prod.variants ?? []);
    if (cheapest) {
      this.selectedColor.set(cheapest.color);
      this.selectedSize.set(cheapest.size);
      return;
    }

    if (prod.colors && prod.colors.length > 0) {
      this.selectedColor.set(prod.colors[0]);
    } else {
      this.selectedColor.set('');
    }

    if (prod.sizes && prod.sizes.length > 0) {
      this.selectedSize.set(prod.sizes[0]);
    } else {
      this.selectedSize.set('');
    }
  }

  private syncSizeForColor(color: string): void {
    const prod = this.product();
    if (!prod) {
      return;
    }

    const sizes = getSizesForColor(prod.variants ?? [], color);
    const currentSize = this.selectedSize();

    if (!sizes.includes(currentSize)) {
      this.selectedSize.set(sizes[0] ?? '');
    }
  }

  private resetSelections(): void {
    this.selectedImage.set('');
    this.selectedColor.set('');
    this.selectedSize.set('');
    this.quantity.set(1);
    this.activeTab.set('description');
  }
}
