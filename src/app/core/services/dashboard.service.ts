import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../models/dashboard';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { mapHttpError } from '../utils/map-http-error';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/admin/dashboard`;

  getSummary(): Observable<DashboardSummary | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    return this.http.get<ResponseWrapper<DashboardSummary>>(this.baseUrl).pipe(
      map((response) => response.data),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(null);
      }),
    );
  }
}
