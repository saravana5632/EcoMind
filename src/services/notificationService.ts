import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export async function createNotification(notifData: Omit<AppNotification, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    const newNotif: AppNotification = {
      ...notifData,
      id: docRef.id,
      read: false,
      createdAt: notifData.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, newNotif);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return '';
  }
}

export function subscribeToUserNotifications(
  userId: string, 
  callback: (notifications: AppNotification[]) => void
): () => void {
  const notifsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notifsRef,
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: AppNotification[] = [];
    snapshot.forEach((docSnap) => {
      notifications.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
    });
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(notifications);
  }, (error) => {
    console.error('Error listening to notifications:', error);
    callback([]);
  });
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function markAllNotificationsAsRead(notifications: AppNotification[]): Promise<void> {
  try {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n => updateDoc(doc(db, NOTIFICATIONS_COLLECTION, n.id), { read: true }))
    );
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}
