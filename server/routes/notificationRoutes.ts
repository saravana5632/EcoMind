import { Router, Response } from 'express';
import { db } from '../db/dataStore';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export const notificationRouter = Router();

// GET /api/notifications
notificationRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = db.getNotificationsForUser(req.user.id, req.user.role);
    res.json({
      success: true,
      message: 'Notifications retrieved',
      data: notifications,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
notificationRouter.put('/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.markNotificationAsRead(req.params.id);
    res.json({
      success,
      message: success ? 'Notification marked as read' : 'Notification not found',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/read-all
notificationRouter.put('/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    db.markAllNotificationsAsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
