import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paginated } from '../models/common/pagination.models';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { ProductHighlightsResponse } from '../models/products/product-highlights.models';
import { ProductResponse } from '../models/products/product-response.models';
import { CatalogProductFilters } from '../models/products/product.models';
import {
  CatalogSearchState,
  sameCatalogSearchState,
  toCatalogApiFilters,
} from '../utils/catalog-search-url';
import {
  buildManagedProductParams,
  hasManagedSearchFilters,
} from '../utils/build-managed-product-query';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/products`;
  private readonly highlightsUrl = `${this.baseUrl}/highlights`;
  private readonly search$ = new Subject<CatalogSearchState>();

  readonly searchResults$: Observable<Paginated<ProductResponse> | null> = this.search$.pipe(
    debounceTime(300),
    distinctUntilChanged(sameCatalogSearchState),
    switchMap((state) => this.fetchProducts(toCatalogApiFilters(state))),
  );

  getHighlights(): Observable<ProductHighlightsResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<ProductHighlightsResponse>>(this.highlightsUrl).pipe(
      map((response) => response.data),
      catchError(() => of(null)),
    );
  }

  getProductById(id: number): Observable<ProductResponse | null> {
    return this.http.get<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => response.data),
      catchError(() => of(null)),
    );
  }

  search(state: CatalogSearchState): void {
    if (!this.isBrowser()) {
      return;
    }

    this.search$.next(state);
  }

  private fetchProducts(
    filters: CatalogProductFilters,
  ): Observable<Paginated<ProductResponse> | null> {
    const params = buildManagedProductParams(filters);
    const url = hasManagedSearchFilters(filters) ? `${this.baseUrl}/search` : this.baseUrl;

    return this.http.get<ResponseWrapper<Paginated<ProductResponse>>>(url, { params }).pipe(
      map((response) => response.data),
      catchError(() => of(null)),
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
