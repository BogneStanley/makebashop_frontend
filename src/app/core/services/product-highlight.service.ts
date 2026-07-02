import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import {
  ProductHighlightType,
  ProductHighlightsConfigResponse,
  SetProductHighlightsRequest,
} from '../models/settings';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProductHighlightService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/admin/product-highlights`;

  getConfig(): Observable<ProductHighlightsConfigResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .get<ResponseWrapper<ProductHighlightsConfigResponse>>(this.baseUrl)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  setHighlights(
    type: ProductHighlightType,
    productIds: number[],
  ): Observable<ProductHighlightsConfigResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const body: SetProductHighlightsRequest = { productIds };

    return this.http
      .put<ResponseWrapper<ProductHighlightsConfigResponse>>(`${this.baseUrl}/${type}`, body)
      .pipe(
        map((response) => response.data),
        tap(() => this.notifications.success('Mise en avant enregistrée.')),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  clearHighlights(type: ProductHighlightType): Observable<ProductHighlightsConfigResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .delete<ResponseWrapper<ProductHighlightsConfigResponse>>(`${this.baseUrl}/${type}`)
      .pipe(
        map((response) => response.data),
        tap(() => this.notifications.success('Mode automatique rétabli.')),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
