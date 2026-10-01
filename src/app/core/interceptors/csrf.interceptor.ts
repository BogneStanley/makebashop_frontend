import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
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
  const token = csrf.getToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { [csrf.getHeaderName()]: token } }));
};
