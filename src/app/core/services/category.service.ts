import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryRequest } from '../models/categories';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { CategoryResponse } from '../models/products/product-response.models';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  private categories = signal<CategoryResponse[]>([]);
  private loading = signal(false);

  readonly categoriesList = this.categories.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  loadCategories(): Observable<CategoryResponse[]> {
    if (!this.isBrowser()) {
      return of([]);
    }

    this.loading.set(true);

    return this.http.get<ResponseWrapper<CategoryResponse[]>>(this.baseUrl).pipe(
      map((response) => response.data),
      tap((data) => this.categories.set(data)),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of([]);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  getCategoryById(id: number): Observable<CategoryResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<CategoryResponse>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => response.data),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  createCategory(input: CategoryRequest): Observable<CategoryResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .post<ResponseWrapper<CategoryResponse>>(this.baseUrl, this.toRequestBody(input))
      .pipe(
        map((response) => response.data),
        tap((created) => {
          this.categories.update((items) => [...items, created]);
          this.notifications.success('Catégorie créée avec succès.');
        }),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  updateCategory(id: number, input: CategoryRequest): Observable<CategoryResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http
      .put<ResponseWrapper<CategoryResponse>>(`${this.baseUrl}/${id}`, this.toRequestBody(input))
      .pipe(
        map((response) => response.data),
        tap((updated) => {
          this.categories.update((items) =>
            items.map((category) => (category.id === id ? updated : category)),
          );
          this.notifications.success('Catégorie mise à jour.');
        }),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  deleteCategory(id: number): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }

    return this.http.delete<ResponseWrapper<null>>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.categories.update((items) => items.filter((category) => category.id !== id));
        this.notifications.success('Catégorie supprimée.');
      }),
      map(() => true),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(false);
      }),
    );
  }

  private toRequestBody(input: CategoryRequest): CategoryRequest {
    const description = input.description?.trim();
    return {
      name: input.name.trim(),
      ...(description ? { description } : {}),
    };
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
