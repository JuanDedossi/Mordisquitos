export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}
