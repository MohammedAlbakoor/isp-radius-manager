import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message: message || 'Operation completed successfully' };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
