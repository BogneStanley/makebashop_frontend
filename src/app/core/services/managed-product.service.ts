import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paginated } from '../models/common/pagination.models';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import {
  AddVariantsRequest,
  CreateProductRequest,
  DeleteImagesRequest,
  DeleteVariantsRequest,
  ProductVariantRequest,
  UpdateImagesPositionRequest,
  UpdateProductRequest,
} from '../models/products/product-request.models';
import { ProductResponse } from '../models/products/product-response.models';
import { ManagedProductFilters } from '../models/products/product.models';
import {
  buildManagedProductParams,
  hasManagedSearchFilters,
} from '../utils/build-managed-product-query';
import {
  buildAddImagesFormData,
  buildCreateProductFormData,
} from '../utils/product-form-data.util';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ManagedProductService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  listManaged(filters: ManagedProductFilters): Observable<Paginated<ProductResponse> | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const params = buildManagedProductParams(filters);
    const url = hasManagedSearchFilters(filters)
      ? `${this.baseUrl}/managed/search`
      : `${this.baseUrl}/managed`;

    return this.http
      .get<ResponseWrapper<Paginated<ProductResponse>>>(url, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  getManagedProductById(id: number): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => response.data),
      catchError(() =>
        this.listManaged({ page: 0, size: 500 }).pipe(
          map((result) => result?.content.find((product) => product.id === id) ?? null),
        ),
      ),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  createProduct(
    request: CreateProductRequest,
    images: File[] = [],
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const formData = buildCreateProductFormData(request, images);

    return this.http
      .post<ResponseWrapper<ProductResponse>>(this.baseUrl, formData)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  updateProduct(
    id: number,
    request: UpdateProductRequest,
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .put<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${id}`, request)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  activateProduct(id: number): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .patch<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  deactivateProduct(id: number): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .patch<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  deleteProduct(id: number): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }

    return this.http.delete<ResponseWrapper<null>>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(false);
      }),
    );
  }

  addVariants(
    productId: number,
    variants: ProductVariantRequest[],
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser() || variants.length === 0) {
      return of(null);
    }

    const body: AddVariantsRequest = { variants };

    return this.http
      .post<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${productId}/variants`, body)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  updateVariant(
    productId: number,
    variantId: number,
    request: ProductVariantRequest,
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .put<ResponseWrapper<ProductResponse>>(
        `${this.baseUrl}/${productId}/variants/${variantId}`,
        request,
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  deleteVariants(
    productId: number,
    variantIds: number[],
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser() || variantIds.length === 0) {
      return of(null);
    }

    const body: DeleteVariantsRequest = { variantIds };

    return this.http
      .delete<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${productId}/variants`, {
        body,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  addImages(productId: number, files: File[]): Observable<ProductResponse | null> {
    if (!this.isBrowser() || files.length === 0) {
      return of(null);
    }

    const formData = buildAddImagesFormData(files);

    return this.http
      .post<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${productId}/images`, formData)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  deleteImages(
    productId: number,
    imageIds: number[],
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser() || imageIds.length === 0) {
      return of(null);
    }

    const body: DeleteImagesRequest = { imageIds };

    return this.http
      .delete<ResponseWrapper<ProductResponse>>(`${this.baseUrl}/${productId}/images`, { body })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  updateImagePositions(
    productId: number,
    positions: UpdateImagesPositionRequest,
  ): Observable<ProductResponse | null> {
    if (!this.isBrowser() || positions.imagesPosition.length === 0) {
      return of(null);
    }

    return this.http
      .put<ResponseWrapper<ProductResponse>>(
        `${this.baseUrl}/${productId}/images/positions`,
        positions,
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  setPrimaryImage(productId: number, imageId: number): Observable<ProductResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .put<ResponseWrapper<ProductResponse>>(
        `${this.baseUrl}/${productId}/images/${imageId}/primary`,
        {},
      )
      .pipe(
        map((response) => response.data),
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
