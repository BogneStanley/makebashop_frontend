---
name: shop-api-integration
description: Integrates shop_front Angular app with the Spring Boot API (HttpClient, cookie auth, Observables, SSR-safe guards, PrimeNG toasts). Use when adding or wiring API calls, auth, HTTP services, interceptors, guards, or replacing mocks with real backend endpoints.
---

# Shop API Integration (Angular)

## Before coding

1. Read API contract: `C:\Users\HP\Documents\Projects\shop\docs\endpoint.md`
2. Auth details: `C:\Users\HP\Documents\Projects\shop\docs\api\auth-cookie-authentication.md`
3. Frontend integration guide: `C:\Users\HP\Documents\Projects\shop\docs\docs\frontend-products\05-integration-backend.md`
4. Match existing code in `src/app/core/` before inventing new patterns

## Non-negotiable rules

| Rule | Detail |
|------|--------|
| **Observable only** | Services return `Observable<T>`. No `Promise`, `async/await`, `firstValueFrom`, `lastValueFrom` for API calls |
| **Cookie auth (browser)** | Login/register: header `X-Auth-Mode: cookie`. All API calls: `withCredentials: true` via interceptor |
| **No token in JS** | Never store JWT in `localStorage`. Session = HttpOnly cookie `access_token` |
| **No HTTP on server** | Guard API calls with `isPlatformBrowser(PLATFORM_ID)` in services |
| **SSR guard** | Route guards that need cookies: return `true` on server, check on browser only |
| **Toasts** | User feedback via `NotificationService` (PrimeNG), not inline alert blocks |
| **Keep it simple** | Minimal diff, reuse `ResponseWrapper`, `mapHttpError`, existing services |

## Quick workflow

```
Task progress:
- [ ] 1. Add/update models in src/app/core/models/<domain>/
- [ ] 2. Add HTTP method in service (returns Observable)
- [ ] 3. Component subscribes (or async pipe)
- [ ] 4. Map errors with mapHttpError → NotificationService
- [ ] 5. Verify SSR: no HTTP on server, protected routes in app.routes.server.ts
- [ ] 6. ng build — no DEP0169 warnings from prerender HTTP
```

## File layout

```
src/
├── environments/environment.ts          # apiUrl: http://localhost:8080/api/v1
├── app/
│   ├── app.config.ts                    # HttpClient, interceptor, MessageService, ensureSession init
│   ├── app.routes.server.ts             # manage/** + login → Server (not Prerender)
│   └── core/
│       ├── interceptors/auth.interceptor.ts
│       ├── guards/admin-auth.guard.ts
│       ├── models/common/api-wrapper.models.ts
│       ├── models/auth/
│       ├── services/auth.service.ts
│       ├── services/notification.service.ts
│       └── utils/map-http-error.ts
```

## Service template

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/resource`;

  getAll(): Observable<Paginated<ItemResponse>> {
    return this.http
      .get<ResponseWrapper<Paginated<ItemResponse>>>(this.baseUrl)
      .pipe(map((r) => r.data));
  }

  create(body: CreateRequest): Observable<ItemResponse> {
    return this.http
      .post<ResponseWrapper<ItemResponse>>(this.baseUrl, body)
      .pipe(
        map((r) => r.data),
        catchError((err) => {
          this.notifications.error(mapHttpError(err));
          return throwError(() => err);
        }),
      );
  }
}
```

## Component consumption

```typescript
this.exampleService.getAll().subscribe({
  next: (data) => this.items.set(data.content),
  error: () => { /* toast already shown in service, or handle here */ },
});
```

## Auth checklist

- `authInterceptor`: `withCredentials: true` for URLs starting with `environment.apiUrl`
- `AuthService.login`: `POST /auth/login` + `X-Auth-Mode: cookie`
- `AuthService.logout`: `POST /auth/logout`
- `AuthService.ensureSession`: `GET /users/me` (browser only, `shareReplay(1)`)
- `isSessionReady` signal: drives admin loading screen
- `adminAuthGuard`: `isPlatformBrowser` → else `true`; client → `ensureSession()` then `isAdmin()`
- `AdminLayout`: show loading UI while `!authService.isSessionReady()`

## SSR checklist

- Protected/auth routes → `RenderMode.Server` in `app.routes.server.ts`
- Do **not** prerender `manage/**` or `login`
- Services must not call API when `!isPlatformBrowser()`
- Avoid `url.parse` DEP0169: never HTTP during prerender

## API response shapes

```typescript
// Success
{ data: T, messageCode: string, message: string }

// Error
{ messageCode: string, error: string, errors: unknown }
```

Use `mapHttpError(error)` for the `error` field in toasts.

## Images

`images[].url` from API are **absolute** (`http://localhost:8080/uploads/...`). Use directly in `<img [src]="image.url">` — do not prefix `apiUrl`.

## Notifications

```typescript
this.notifications.success('Message');
this.notifications.error(mapHttpError(err));
this.notifications.info('Message');
```

Requires `<p-toast />` in `app.html` and `MessageService` in `app.config.ts`.

## Additional resources

- Code templates and auth flow: [reference.md](reference.md)
