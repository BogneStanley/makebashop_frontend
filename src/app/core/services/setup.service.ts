import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { InitialAdminSetupRequest, SetupStatusResponse } from '../models/setup/setup.models';

@Injectable({
  providedIn: 'root',
})
export class SetupService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/setup`;

  getStatus(): Observable<SetupStatusResponse> {
    return this.http
      .get<ResponseWrapper<SetupStatusResponse>>(this.url)
      .pipe(map((response) => response.data));
  }

  complete(request: InitialAdminSetupRequest): Observable<void> {
    return this.http
      .post<ResponseWrapper<unknown>>(this.url, request)
      .pipe(map(() => undefined));
  }
}
