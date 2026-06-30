import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser } from '../models/auth';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { mapHttpError } from '../utils/map-http-error';

export interface LoginResult {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private currentUser = signal<AuthUser | null>(null);
  private sessionChecked = signal(false);
  private sessionLoad$: Observable<void> | null = null;
  private readonly adminRoles = ['ADMIN', 'MANAGER'];
  private readonly baseUrl = environment.apiUrl;

  isAuthenticated = computed(() => this.currentUser() !== null);

  isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return this.adminRoles.includes(role ?? '');
  });

  isSessionReady = computed(() => this.sessionChecked());

  getCurrentUser() {
    return this.currentUser;
  }

  ensureSession(): Observable<void> {
    if (!this.isBrowser()) {
      return of(undefined);
    }

    if (this.sessionChecked()) {
      return of(undefined);
    }

    this.sessionLoad$ ??= this.loadProfile().pipe(shareReplay(1));
    return this.sessionLoad$;
  }

  login(email: string, password: string): Observable<LoginResult> {
    if (!this.isBrowser()) {
      return of({ success: false, error: 'Connexion indisponible.' });
    }

    return this.http
      .post<ResponseWrapper<AuthResponse>>(`${this.baseUrl}/auth/login`, { email, password }, {
        headers: { 'X-Auth-Mode': 'cookie' },
      })
      .pipe(
        switchMap((response) => {
          const user = response.data.user;

          if (!this.canAccessAdmin(user)) {
            return this.logout().pipe(
              map(() => ({
                success: false,
                error: 'Accès réservé aux administrateurs.',
              })),
            );
          }

          this.currentUser.set(user);
          this.sessionChecked.set(true);
          return of({ success: true });
        }),
        catchError((error) =>
          of({
            success: false,
            error: mapHttpError(error),
          }),
        ),
      );
  }

  logout(): Observable<void> {
    if (!this.isBrowser()) {
      this.clearSession();
      return of(undefined);
    }

    return this.http.post(`${this.baseUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      finalize(() => this.clearSession()),
      map(() => undefined),
    );
  }

  clearSession(): void {
    this.currentUser.set(null);
    this.sessionChecked.set(false);
    this.sessionLoad$ = null;
  }

  private loadProfile(): Observable<void> {
    return this.http.get<ResponseWrapper<AuthUser>>(`${this.baseUrl}/users/me`).pipe(
      tap((response) => this.currentUser.set(response.data)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
      finalize(() => this.sessionChecked.set(true)),
      map(() => undefined),
    );
  }

  private canAccessAdmin(user: AuthUser): boolean {
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
