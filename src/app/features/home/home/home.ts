import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { Product } from '../../../core/services/product.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { ContactSettingsService } from '../../../core/services/contact-settings.service';
import { CONTACT_KEYS } from '../../../core/models/settings';
import { toShopProduct } from '../../../core/utils/map-product-response';
import { ProductCard } from '../../../shared/product-card/product-card';
import { Footer } from '../../../shared/footer/footer';
import { Header } from '../../../shared/header/header';
import { Hero } from '../hero/hero';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    Footer,
    Hero,
    ProductCard,
    ButtonModule,
    InputTextModule,
    RouterModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private catalogService = inject(CatalogService);
  private contactSettingsService = inject(ContactSettingsService);

  loading = signal(true);
  featured = signal<Product[]>([]);
  news = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  whatsappGroupUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.contactSettingsService.getContacts().subscribe((settings) => {
      const groupUrl = settings?.contacts?.[CONTACT_KEYS.whatsappGroup];
      this.whatsappGroupUrl.set(groupUrl?.trim() || null);
    });

    this.catalogService
      .getHighlights()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((highlights) => {
        if (!highlights) {
          return;
        }

        this.featured.set(highlights.featuredProducts.map(toShopProduct));
        this.news.set(highlights.newProducts.map(toShopProduct));
        this.bestSellers.set(highlights.popularProducts.map(toShopProduct));
      });
  }

  openWhatsappGroup(): void {
    const url = this.whatsappGroupUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
