import { getApiErrorPresentation } from './api-error-handler';

export function mapHttpError(error: unknown): string {
  return getApiErrorPresentation(error).message;
}
