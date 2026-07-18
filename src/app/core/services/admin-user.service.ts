import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUsersPage,
  AdminUsersQuery,
  AuthUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '../models/auth';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  listUsers(query: AdminUsersQuery = {}): Observable<AdminUsersPage | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const params = this.buildParams(query);

    return this.http
      .get<ResponseWrapper<AdminUsersPage>>(this.baseUrl, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  createUser(body: CreateAdminUserRequest): Observable<AuthUser | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.post<ResponseWrapper<AuthUser>>(this.baseUrl, body).pipe(
      map((response) => response.data),
      tap(() => this.notifications.success('Utilisateur créé avec succès.')),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  updateUser(id: number, body: UpdateAdminUserRequest): Observable<AuthUser | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.put<ResponseWrapper<AuthUser>>(`${this.baseUrl}/${id}`, body).pipe(
      map((response) => response.data),
      tap(() => this.notifications.success('Utilisateur mis à jour.')),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  deleteUser(id: number): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }

    return this.http.delete<ResponseWrapper<null>>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.notifications.success('Utilisateur supprimé.')),
      map(() => true),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(false);
      }),
    );
  }

  activateUser(id: number): Observable<AuthUser | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.patch<ResponseWrapper<AuthUser>>(`${this.baseUrl}/${id}/activate`, {}).pipe(
      map((response) => response.data),
      tap(() => this.notifications.success('Utilisateur activé.')),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  deactivateUser(id: number): Observable<AuthUser | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.patch<ResponseWrapper<AuthUser>>(`${this.baseUrl}/${id}/deactivate`, {}).pipe(
      map((response) => response.data),
      tap(() => this.notifications.success('Utilisateur désactivé.')),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  private buildParams(query: AdminUsersQuery): HttpParams {
    let params = new HttpParams();

    if (query.page !== undefined) {
      params = params.set('page', String(query.page));
    }
    if (query.size !== undefined) {
      params = params.set('size', String(query.size));
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }

    return params;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
