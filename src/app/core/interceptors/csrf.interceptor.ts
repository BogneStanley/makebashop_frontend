import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CsrfService } from '../services/csrf.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_EXEMPT_PATHS = ['/auth/login', '/auth/register'];

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    !req.url.startsWith(environment.apiUrl) ||
    SAFE_METHODS.has(req.method) ||
    CSRF_EXEMPT_PATHS.some((path) => req.url.startsWith(`${environment.apiUrl}${path}`))
  ) {
    return next(req);
  }

  const csrf = inject(CsrfService);
  const send = (token: string | null): Observable<HttpEvent<unknown>> =>
    next(
      token
        ? req.clone({
            setHeaders: { [csrf.getHeaderName()]: token },
          })
        : req,
    );

  const cachedToken = csrf.getToken();
  return cachedToken
    ? send(cachedToken)
    : csrf.refreshToken().pipe(switchMap((token) => send(token)));
};
