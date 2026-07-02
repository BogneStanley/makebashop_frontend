import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import {
  ProductHighlightType,
  ProductHighlightsConfigResponse,
} from '../../../core/models/settings';
import { ManagedProductService } from '../../../core/services/managed-product.service';
import { ProductHighlightService } from '../../../core/services/product-highlight.service';

const MAX_HIGHLIGHTS = 4;

interface HighlightSectionView {
  type: ProductHighlightType;
  title: string;
  description: string;
  automaticHint: string;
  configured: boolean;
  productIds: number[];
}

interface ProductOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-settings-page',
  imports: [
    FormsModule,
    ButtonModule,
    MessageModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage implements OnInit {
  private highlightService = inject(ProductHighlightService);
  private managedProductService = inject(ManagedProductService);

  readonly maxHighlights = MAX_HIGHLIGHTS;

  loading = signal(true);
  error = signal<string | null>(null);
  savingType = signal<ProductHighlightType | null>(null);
  clearingType = signal<ProductHighlightType | null>(null);
  productOptions = signal<ProductOption[]>([]);
  sections = signal<HighlightSectionView[]>([]);

  ngOnInit(): void {
    this.loadProductOptions();
    this.loadConfig();
  }

  saveSection(section: HighlightSectionView): void {
    if (this.savingType() || this.clearingType()) {
      return;
    }

    this.savingType.set(section.type);
    this.highlightService
      .setHighlights(section.type, section.productIds)
      .pipe(finalize(() => this.savingType.set(null)))
      .subscribe((config) => {
        if (config) {
          this.applyConfig(config);
        }
      });
  }

  revertToAutomatic(section: HighlightSectionView): void {
    if (this.savingType() || this.clearingType()) {
      return;
    }

    this.clearingType.set(section.type);
    this.highlightService
      .clearHighlights(section.type)
      .pipe(finalize(() => this.clearingType.set(null)))
      .subscribe((config) => {
        if (config) {
          this.applyConfig(config);
        }
      });
  }

  updateProductIds(section: HighlightSectionView, productIds: number[]): void {
    this.sections.update((items) =>
      items.map((item) =>
        item.type === section.type ? { ...item, productIds: [...productIds] } : item,
      ),
    );
  }

  isSaving(type: ProductHighlightType): boolean {
    return this.savingType() === type;
  }

  isClearing(type: ProductHighlightType): boolean {
    return this.clearingType() === type;
  }

  private loadConfig(): void {
    this.loading.set(true);
    this.error.set(null);

    this.highlightService
      .getConfig()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((config) => {
        if (!config) {
          this.error.set('Impossible de charger les mises en avant.');
          return;
        }
        this.applyConfig(config);
      });
  }

  private loadProductOptions(): void {
    this.managedProductService
      .listManaged({ page: 0, size: 500, isActive: true, sortBy: 'name', sortOrder: 'asc' })
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.productOptions.set(
          result.content.map((product) => ({
            value: product.id,
            label: product.name,
          })),
        );
      });
  }

  private applyConfig(config: ProductHighlightsConfigResponse): void {
    this.sections.set([
      {
        type: 'NEW',
        title: 'Nouveautés',
        description: 'Produits affichés dans la section nouveautés de la page d’accueil.',
        automaticHint: 'Mode auto : les 4 produits les plus récents.',
        configured: config.newProducts.configured,
        productIds: config.newProducts.products.map((product) => product.id),
      },
      {
        type: 'POPULAR',
        title: 'Populaires',
        description: 'Produits mis en avant comme best-sellers.',
        automaticHint: 'Mode auto : les 4 produits les plus vendus.',
        configured: config.popularProducts.configured,
        productIds: config.popularProducts.products.map((product) => product.id),
      },
      {
        type: 'FEATURED',
        title: 'À la une',
        description: 'Sélection éditoriale affichée en priorité sur la home.',
        automaticHint: 'Mode auto : aucun produit (liste vide).',
        configured: config.featuredProducts.configured,
        productIds: config.featuredProducts.products.map((product) => product.id),
      },
    ]);
  }
}
