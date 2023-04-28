export interface PaginatedResult<T> {
  count: number;
  totalPages: number;
  currentPage: number;
  results: T[];
}
