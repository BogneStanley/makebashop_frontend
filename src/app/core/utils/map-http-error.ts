import { HttpErrorResponse } from '@angular/common/http';
import { ErrorWrapper } from '../models/common/api-wrapper.models';

export function mapHttpError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Une erreur est survenue.';
  }

  const body = error.error as ErrorWrapper | undefined;
  return body?.error ?? 'Une erreur est survenue.';
}
