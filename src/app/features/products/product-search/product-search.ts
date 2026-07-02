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
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { CatalogService } from '../../../core/services/catalog.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/services/product.service';
import {
  CATALOG_DEFAULT_MAX_PRICE,
  CATALOG_DEFAULT_STATE,
  CatalogSearchState,
  parseCatalogSearchParams,
  sameCatalogSearchState,
  toCatalogQueryParams,
} from '../../../core/utils/catalog-search-url';
import { toShopProduct } from '../../../core/utils/map-product-response';
import { Footer } from '../../../shared/footer/footer';
import { Header } from '../../../shared/header/header';
import { ProductCard } from '../../../shared/product-card/product-card';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-search',
  imports: [
    CommonModule,
    FormsModule,
    Header,
    Footer,
    ProductCard,
    InputTextModule,
    SliderModule,
    CheckboxModule,
    ButtonModule,
    SelectModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './product-search.html',
  styleUrl: './product-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearch implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private catalogService = inject(CatalogService);
  private categoryService = inject(CategoryService);

  readonly categories = this.categoryService.categoriesList;
  readonly maxPrice = CATALOG_DEFAULT_MAX_PRICE;

  sortOptions: SortOption[] = [
    { label: 'Pertinence', value: 'default' },
    { label: 'Prix : croissant', value: 'price-asc' },
    { label: 'Prix : décroissant', value: 'price-desc' },
    { label: 'Nom : A-Z', value: 'name-asc' },
    { label: 'Nom : Z-A', value: 'name-desc' },
  ];

  filters = signal<CatalogSearchState>(CATALOG_DEFAULT_STATE);
  priceRange = computed(() => {
    const { minPrice, maxPrice } = this.filters();
    return [minPrice, maxPrice];
  });
  products = signal<Product[]>([]);
  totalCount = signal(0);
  loading = signal(false);

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe();

    this.catalogService.searchResults$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.loading.set(false);

        if (!result) {
          this.products.set([]);
          this.totalCount.set(0);
          return;
        }

        this.products.set(result.content.map(toShopProduct));
        this.totalCount.set(result.totalElements);
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const state = parseCatalogSearchParams(params);

      if (!sameCatalogSearchState(state, this.filters())) {
        this.filters.set(state);
      }

      this.loading.set(true);
      this.catalogService.search(state);
    });
  }

  patchFilters(partial: Partial<CatalogSearchState>): void {
    const next = { ...this.filters(), ...partial };

    if (sameCatalogSearchState(next, this.filters())) {
      return;
    }

    this.filters.set(next);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toCatalogQueryParams(next),
      replaceUrl: true,
    });
  }

  resetFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
