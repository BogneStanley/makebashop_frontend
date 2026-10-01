import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseWrapper } from '../models/common/api-wrapper.models';

interface CsrfTokenResponse {
  token: string;
  headerName: string;
}

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly token = signal<string | null>(null);
  private readonly headerName = signal('X-XSRF-TOKEN');

  initialize(): Observable<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }

    return this.http
      .get<ResponseWrapper<CsrfTokenResponse>>(`${environment.apiUrl}/auth/csrf`)
      .pipe(
        tap((response) => {
          this.token.set(response.data.token);
          this.headerName.set(response.data.headerName);
        }),
        map(() => undefined),
        catchError(() => of(undefined)),
      );
  }

  getToken(): string | null {
    return this.token();
  }

  getHeaderName(): string {
    return this.headerName();
  }
}
