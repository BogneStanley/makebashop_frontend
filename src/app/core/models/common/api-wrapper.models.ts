export interface ResponseWrapper<T> {
  data: T;
  messageCode: string;
  message: string;
}

export interface ErrorWrapper<T = unknown> {
  errors: T | null;
  messageCode?: string | null;
  error?: string | null;
}
