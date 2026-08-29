import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const list = await NotificationService.getUserNotifications(userId);
      return sendSuccess(res, list, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { id } = req.params;
      await NotificationService.markAsRead(id, userId);
      return sendSuccess(res, { read: true }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      await NotificationService.markAllAsRead(userId);
      return sendSuccess(res, { success: true }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
