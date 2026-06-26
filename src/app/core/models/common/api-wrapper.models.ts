export interface ResponseWrapper<T> {
  data: T;
  messageCode: string;
  message: string;
}

export interface ErrorWrapper<T = unknown> {
  errors: T;
  messageCode: string;
  error: string;
}
