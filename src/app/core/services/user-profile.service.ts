import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, UpdatePasswordRequest, UpdateProfileRequest } from '../models/auth';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { mapHttpError } from '../utils/map-http-error';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/users/me`;

  getProfile(): Observable<AuthUser | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<AuthUser>>(this.baseUrl).pipe(
      map((response) => response.data),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  updateProfile(body: UpdateProfileRequest): Observable<AuthUser | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.put<ResponseWrapper<AuthUser>>(this.baseUrl, body).pipe(
      map((response) => response.data),
      tap((user) => {
        this.authService.syncCurrentUser(user);
        this.notifications.success('Profil mis à jour.');
      }),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  updatePassword(body: UpdatePasswordRequest): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }

    return this.http.put<ResponseWrapper<null>>(`${this.baseUrl}/password`, body).pipe(
      map(() => true),
      tap(() => this.notifications.success('Mot de passe mis à jour.')),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(false);
      }),
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
