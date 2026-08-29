import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export function authorizeRoles(...allowedRoles: Array<'FARMER' | 'LANDLORD' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before role authorization.', 401, 'UNAUTHORIZED');
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole as any)) {
      return sendError(
        res,
        `Access denied. Role '${userRole}' is not authorized to perform this operation.`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
}
