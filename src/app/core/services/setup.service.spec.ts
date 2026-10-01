import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetupService } from './setup.service';

describe('SetupService', () => {
  let service: SetupService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SetupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('retrieves the initial setup status', () => {
    let setupRequired: boolean | undefined;

    service.getStatus().subscribe((status) => (setupRequired = status.setupRequired));

    const request = http.expectOne('http://localhost:8080/api/v1/setup');
    expect(request.request.method).toBe('GET');
    request.flush({
      data: { setupRequired: true },
      messageCode: 'SETUP_REQUIRED',
      message: 'Initial setup is available',
    });

    expect(setupRequired).toBe(true);
  });

  it('sends only the initial administrator data', () => {
    service
      .complete({
        email: 'admin@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        password: 'Str0ng-password!',
      })
      .subscribe();

    const request = http.expectOne('http://localhost:8080/api/v1/setup');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'admin@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      password: 'Str0ng-password!',
    });
    request.flush({ data: {}, messageCode: 'INITIAL_ADMIN_CREATED', message: 'Initial administrator created' });
  });
});
