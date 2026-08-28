import { FirebaseService } from './firebaseService';
import { COLLECTIONS } from '../config/constants';
import { NotificationModel, INotification } from '../models/Notification';
import { logger } from '../utils/logger';

export class NotificationService {
  /**
   * Send notification to a specific user
   */
  static async sendNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    link?: string;
  }): Promise<INotification> {
    try {
      const data = NotificationModel.format({
        userId: params.userId,
        recipientId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
        relatedLandId: params.relatedId,
        read: false,
        link: params.link,
      });

      const result = await FirebaseService.createDocument<INotification>(COLLECTIONS.AGRI_NOTIFICATIONS, data);
      return result;
    } catch (error) {
      logger.error('[NotificationService] Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(userId: string): Promise<INotification[]> {
    try {
      const notifications = await FirebaseService.queryCollection<INotification>(
        COLLECTIONS.AGRI_NOTIFICATIONS,
        [{ field: 'userId', operator: '==', value: userId }],
        { orderByField: 'createdAt', orderDirection: 'desc', limit: 50 }
      );
      return notifications;
    } catch (error) {
      // Fallback query without orderBy if index is building
      const notifications = await FirebaseService.queryCollection<INotification>(
        COLLECTIONS.AGRI_NOTIFICATIONS,
        [{ field: 'userId', operator: '==', value: userId }],
        { limit: 50 }
      );
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    await FirebaseService.updateDocument(COLLECTIONS.AGRI_NOTIFICATIONS, notificationId, {
      read: true,
    });
    return true;
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    const list = await this.getUserNotifications(userId);
    const unread = list.filter((n) => !n.read);
    for (const item of unread) {
      if (item.id) {
        await FirebaseService.updateDocument(COLLECTIONS.AGRI_NOTIFICATIONS, item.id, {
          read: true,
        }).catch(() => {});
      }
    }
    return true;
  }
}
