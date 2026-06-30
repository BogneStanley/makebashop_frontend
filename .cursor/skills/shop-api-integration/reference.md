# Shop API Integration — Reference

## Environment

```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080/api/v1',
};
```

## app.config.ts providers

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAppInitializer, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

providers: [
  MessageService,
  provideAppInitializer(() => inject(AuthService).ensureSession()),
  provideHttpClient(withInterceptors([authInterceptor])),
  // ...
]
```

## Auth interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};
```

## Auth models

```typescript
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: UserRole;
  isActivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string | null; // null in cookie mode
}
```

## AuthService patterns

```typescript
// State
private currentUser = signal<AuthUser | null>(null);
private sessionChecked = signal(false);
private sessionLoad$: Observable<void> | null = null;

isSessionReady = computed(() => this.sessionChecked());
isAdmin = computed(() => ['ADMIN', 'MANAGER'].includes(this.currentUser()?.role ?? ''));

// Browser-only HTTP
private isBrowser(): boolean {
  return isPlatformBrowser(this.platformId);
}

ensureSession(): Observable<void> {
  if (!this.isBrowser() || this.sessionChecked()) {
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
    .post<ResponseWrapper<AuthResponse>>(`${baseUrl}/auth/login`, { email, password }, {
      headers: { 'X-Auth-Mode': 'cookie' },
    })
    .pipe(/* switchMap, catchError with mapHttpError */);
}
```

## Admin auth guard

```typescript
export const adminAuthGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // defer to client
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureSession().pipe(
    map(() => (authService.isAdmin() ? true : router.createUrlTree(['/login']))),
  );
};
```

## Admin loading screen

```html
@if (!authService.isSessionReady()) {
  <div class="admin-loading" role="status" aria-busy="true">
    <p-progressSpinner />
    <p>Vérification de votre session…</p>
  </div>
} @else {
  <!-- admin shell + router-outlet -->
}
```

## app.routes.server.ts

```typescript
export const serverRoutes: ServerRoute[] = [
  { path: 'products/:id', renderMode: RenderMode.Server },
  { path: 'manage/**', renderMode: RenderMode.Server },
  { path: 'login', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
```

## mapHttpError

```typescript
export function mapHttpError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Une erreur est survenue.';
  }
  const body = error.error as ErrorWrapper | undefined;
  return body?.error ?? 'Une erreur est survenue.';
}
```

## Error handling in services

Prefer catching at service level and returning a safe Observable:

```typescript
.pipe(
  map((r) => r.data),
  catchError((error) => {
    return of({ success: false, error: mapHttpError(error) });
    // or: return throwError(() => error) after notifying
  }),
)
```

## Public vs admin product endpoints

| Context | Endpoints |
|---------|-----------|
| Boutique | `GET /products`, `/search`, `/{id}` (actifs) |
| Back-office | `GET /products/managed`, `/managed/search` + mutations |

## Auth endpoints summary

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/login` | `X-Auth-Mode: cookie`, body `{ email, password }` |
| POST | `/auth/logout` | clears cookie |
| POST | `/auth/register` | optional, same auth mode header |
| GET | `/users/me` | restore session on reload |

## Common pitfalls

1. **Reload redirects to login** — guard ran on SSR without cookie → guard must skip server
2. **Admin flash on reload** — prerender manage routes + no loading screen → use Server mode + `isSessionReady`
3. **DEP0169 url.parse** — HTTP during prerender → no API on server, no prerender for auth routes
4. **CORS** — backend must allow `http://localhost:4200` with `allowCredentials: true`
5. **Promise in service** — forbidden; always Observable

## Replacing mocks

1. Define HTTP service alongside or replacing mock
2. Use same return types as mock (or map API response → view model in `map()`)
3. Swap provider if using DI token, or replace mock service methods directly
4. Test: login → protected page → reload → stays connected
