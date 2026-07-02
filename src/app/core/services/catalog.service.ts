import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { ProductHighlightsResponse } from '../models/products/product-highlights.models';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly highlightsUrl = `${environment.apiUrl}/products/highlights`;

  getHighlights(): Observable<ProductHighlightsResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<ProductHighlightsResponse>>(this.highlightsUrl).pipe(
      map((response) => response.data),
      catchError(() => of(null)),
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
