import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ContactSettingsService } from './contact-settings.service';
import { NotificationService } from './notification.service';
import { OrderService } from './order.service';
import { OrderResponse } from '../models/orders/order-response.models';

const order = {
  id: 42,
  orderNumber: 'ORD-42',
  status: 'PENDING',
  customerFirstName: 'Ada',
  customerLastName: 'Lovelace',
  customerEmail: 'ada@example.com',
  customerPhoneNumber: '+237 699 000 000',
  note: null,
  totalAmount: { amount: 12000, currency: 'XAF' },
  createdAt: '2026-10-01T12:00:00',
  updatedAt: '2026-10-01T12:00:00',
  items: [],
} as unknown as OrderResponse;

describe('OrderService checkout', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ContactSettingsService,
          useValue: {
            getContacts: () =>
              of({ contacts: { whatsapp: '+237 699 123 456' }, updatedAt: '2026-10-01T12:00:00' }),
            buildWhatsappUrl: vi.fn(() => 'https://wa.me/237699123456'),
          },
        },
        { provide: NotificationService, useValue: { error: vi.fn() } },
      ],
    });

    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a checkout request with the idempotency key and optional customer details', () => {
    let result: string | undefined;

    service
      .checkoutFromCart(
        {
          customerFirstName: 'Ada',
          customerLastName: 'Lovelace',
          customerEmail: ' ada@example.com ',
          customerPhoneNumber: '+237 699 000 000',
          note: ' À livrer demain ',
        },
        'checkout-42',
      )
      .subscribe((response) => (result = response?.whatsappUrl));

    const request = http.expectOne('https://mabeba-shop-api.stanleybogne.com/api/v1/orders/checkout');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe('checkout-42');
    expect(request.request.body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phoneNumber: '+237 699 000 000',
      note: 'À livrer demain',
    });

    request.flush({ data: order, messageCode: 'ORDER_CREATED', message: 'Order created' });

    expect(result).toBe('https://wa.me/237699123456');
  });
});
