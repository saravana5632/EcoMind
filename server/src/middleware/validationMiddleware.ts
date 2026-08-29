import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.issues) {
        const issues = error.issues || error.errors || [];
        const errorMessages = issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return sendError(res, `Validation failed: ${errorMessages}`, 422, 'VALIDATION_ERROR', issues);
      }
      return sendError(res, 'Invalid request data.', 400, 'INVALID_PAYLOAD');
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as any;
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.issues) {
        const issues = error.issues || error.errors || [];
        const errorMessages = issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return sendError(res, `Query validation failed: ${errorMessages}`, 422, 'QUERY_VALIDATION_ERROR', issues);
      }
      return sendError(res, 'Invalid query parameters.', 400, 'INVALID_QUERY');
    }
  };
}
