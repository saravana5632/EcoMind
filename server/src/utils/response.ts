import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  timestamp?: string;
}

export interface PaginatedResult<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errorCode: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): Response {
  const payload: ApiResponse & { details?: any } = {
    success: false,
    message,
    errorCode,
    details,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): Response {
  const totalPages = Math.ceil(total / (limit || 10));
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages: Math.max(1, totalPages),
    },
    timestamp: new Date().toISOString(),
  });
}
