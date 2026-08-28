import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`[ErrorHandler] [${req.method} ${req.originalUrl}] Error:`, err?.message || err);

  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';
  const details = err.details || undefined;

  return sendError(res, message, statusCode, errorCode, details);
}
