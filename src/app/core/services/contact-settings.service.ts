import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import {
  ContactSettings,
  UpdateContactSettingsRequest,
} from '../models/settings/contact-settings.models';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ContactSettingsService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly publicUrl = `${environment.apiUrl}/contact`;
  private readonly adminUrl = `${environment.apiUrl}/admin/contact-settings`;
  private contactsCache$?: Observable<ContactSettings | null>;

  getContacts(): Observable<ContactSettings | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    if (!this.contactsCache$) {
      this.contactsCache$ = this.http
        .get<ResponseWrapper<ContactSettings>>(this.publicUrl)
        .pipe(
          map((response) => response.data),
          catchError(() => of(null)),
          shareReplay(1),
        );
    }

    return this.contactsCache$;
  }

  getAdminContacts(): Observable<ContactSettings | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<ContactSettings>>(this.adminUrl).pipe(
      map((response) => response.data),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  updateContacts(contacts: Record<string, string>): Observable<ContactSettings | null> {
    if (!this.isBrowser()) {
      return of(null);
    }

    const body: UpdateContactSettingsRequest = { contacts };

    return this.http.put<ResponseWrapper<ContactSettings>>(this.adminUrl, body).pipe(
      map((response) => response.data),
      tap(() => {
        this.invalidateCache();
        this.notifications.success('Contacts enregistrés.');
      }),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }

  buildWhatsappUrl(phone: string, text?: string): string {
    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      return '';
    }

    if (!text) {
      return `https://wa.me/${digits}`;
    }

    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

  invalidateCache(): void {
    this.contactsCache$ = undefined;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
