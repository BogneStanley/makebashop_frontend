import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartContextService } from '../services/cart-context.service';

export const cartInterceptor: HttpInterceptorFn = (req, next) => {
  const isCartRequest =
    req.url.startsWith(`${environment.apiUrl}/cart`) ||
    req.url.startsWith(`${environment.apiUrl}/orders/checkout`);

  if (!isCartRequest) {
    return next(req);
  }

  const cartId = inject(CartContextService).getCartId();
  if (cartId == null) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { 'X-Cart-Id': String(cartId) },
    }),
  );
};
