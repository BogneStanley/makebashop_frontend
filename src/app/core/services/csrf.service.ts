import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly cookieName = 'XSRF-TOKEN';

  initialize(): Observable<void> {
    return this.refreshToken().pipe(map(() => undefined));
  }

  /** Ensures that Spring's CSRF cookie exists and is readable by the browser app. */
  refreshToken(): Observable<string | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    return this.http.get<void>(`${environment.apiUrl}/auth/csrf`).pipe(
      map(() => this.getToken()),
      catchError(() => of(null)),
    );
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const prefix = `${this.cookieName}=`;
    const cookie = this.document.cookie
      .split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
  }

  getHeaderName(): string {
    return 'X-XSRF-TOKEN';
  }
}
