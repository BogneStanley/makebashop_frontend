import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { Paginated } from '../models/common/pagination.models';
import {
  CheckoutCustomerInfo,
  CheckoutOrderRequest,
  CreateOrderResponse,
} from '../models/orders/create-order.models';
import {
  ManagedOrderFilters,
  OrderListItemView,
  toOrderListItemView,
} from '../models/orders/order.models';
import { OrderResponse } from '../models/orders/order-response.models';
import { buildOrderParams, hasOrderSearchFilters } from '../utils/build-order-query';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

const SHOP_WHATSAPP_NUMBER = '221771234567';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  listManaged(filters: ManagedOrderFilters): Observable<Paginated<OrderListItemView> | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const params = buildOrderParams(filters);
    const url = hasOrderSearchFilters(filters) ? `${this.baseUrl}/search` : this.baseUrl;

    return this.http.get<ResponseWrapper<Paginated<OrderResponse>>>(url, { params }).pipe(
      map((response) => this.mapPaginatedOrders(response.data)),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  getOrderById(id: number): Observable<OrderResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<OrderResponse>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => response.data),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  checkoutFromCart(customerInfo: CheckoutCustomerInfo): Observable<CreateOrderResponse | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const body: CheckoutOrderRequest = {
      firstName: customerInfo.customerFirstName,
      lastName: customerInfo.customerLastName,
      phoneNumber: customerInfo.customerPhoneNumber,
    };

    const email = customerInfo.customerEmail?.trim();
    if (email) {
      body.email = email;
    }

    const note = customerInfo.note?.trim();
    if (note) {
      body.note = note;
    }

    return this.http
      .post<ResponseWrapper<OrderResponse>>(`${this.baseUrl}/checkout`, body)
      .pipe(
        map((response) => ({
          order: response.data,
          whatsappUrl: this.buildWhatsappUrl(response.data),
        })),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          return of(null);
        }),
      );
  }

  markAsPaid(orderId: number): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }

    return this.http.put<ResponseWrapper<null>>(`${this.baseUrl}/${orderId}/paid`, {}).pipe(
      map(() => true),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(false);
      }),
    );
  }

  markAsCancelled(orderId: number): Observable<boolean> {
    if (!this.isBrowser()) {
      return of(false);
    }

    return this.http.put<ResponseWrapper<null>>(`${this.baseUrl}/${orderId}/cancel`, {}).pipe(
      map(() => true),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(false);
      }),
    );
  }

  buildWhatsappUrl(order: OrderResponse): string {
    const lines = [
      `Bonjour, je souhaite confirmer ma commande *${order.orderNumber}*.`,
      '',
      `*Client :* ${order.customerFirstName} ${order.customerLastName}`,
      `*Téléphone :* ${order.customerPhoneNumber}`,
    ];

    if (order.customerEmail) {
      lines.push(`*Email :* ${order.customerEmail}`);
    }

    lines.push(
      '',
      '*Articles :*',
      ...order.items.map(
        (item) =>
          `- ${item.product.name}${item.variant.size ? ` (${item.variant.size})` : ''} x${item.quantity} — ${item.subtotal.amount.toLocaleString('fr-FR')} ${item.subtotal.currency}`,
      ),
      '',
      `*Total :* ${order.totalAmount.amount.toLocaleString('fr-FR')} ${order.totalAmount.currency}`,
    );

    if (order.note) {
      lines.push('', `*Note :* ${order.note}`);
    }

    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${text}`;
  }

  private mapPaginatedOrders(
    page: Paginated<OrderResponse>,
  ): Paginated<OrderListItemView> {
    return {
      ...page,
      content: page.content.map(toOrderListItemView),
    };
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
