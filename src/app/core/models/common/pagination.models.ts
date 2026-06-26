export interface SortMeta {
  property: string;
  direction: 'asc' | 'desc';
}

export interface Paginated<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  content: T[];
  first: boolean;
  last: boolean;
  empty: boolean;
  sort: SortMeta;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
