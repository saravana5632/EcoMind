import { COLLECTIONS } from '../config/constants';

export interface INotification {
  id?: string;
  userId: string;
  recipientId?: string; // UI compatibility
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedLandId?: string; // UI compatibility
  read: boolean;
  link?: string;
  createdAt: string;
}

export const NotificationModel = {
  collection: COLLECTIONS.AGRI_NOTIFICATIONS,
  format: (data: any, id?: string): INotification => ({
    id: id || data.id,
    userId: data.userId || data.recipientId || '',
    recipientId: data.recipientId || data.userId || '',
    type: data.type || 'SYSTEM',
    title: data.title || 'Notification',
    message: data.message || '',
    relatedId: data.relatedId || data.relatedLandId || undefined,
    relatedLandId: data.relatedLandId || data.relatedId || undefined,
    read: data.read ?? false,
    link: data.link || undefined,
    createdAt: data.createdAt || new Date().toISOString(),
  }),
};
