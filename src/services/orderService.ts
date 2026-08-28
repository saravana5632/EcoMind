import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus, UserProfile } from '../types';
import { deductProductStock } from './productService';
import { createNotification } from './notificationService';

const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';

// Create a new customer order with inventory decrement
export async function createCustomerOrder(orderData: Omit<Order, 'id' | 'orderId' | 'createdAt' | 'orderStatus' | 'deliveryPartnerId'>): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // 1. Deduct stock safely
    const stockDeducted = await deductProductStock(
      orderData.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
    );

    if (!stockDeducted) {
      return { success: false, error: 'Could not reserve inventory. Some items might be low on stock.' };
    }

    // 2. Generate clean readable ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const readableOrderId = `ECO-${randomNum}`;
    const docRef = doc(collection(db, ORDERS_COLLECTION));
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: docRef.id,
      orderId: readableOrderId,
      orderStatus: 'placed',
      deliveryPartnerId: null,
      createdAt: now,
      updatedAt: now,
      statusTimeline: {
        placedAt: now
      }
    };

    await setDoc(docRef, newOrder);

    // 3. Create initial notification for customer
    await createNotification({
      userId: orderData.customerId,
      role: 'customer',
      title: 'Order Placed Successfully! 🛒',
      message: `Your farm produce order #${readableOrderId} of ₹${orderData.totalAmount} has been placed and is being matched with a delivery partner.`,
      type: 'order_status',
      orderId: docRef.id,
      read: false,
      createdAt: now
    });

    return { success: true, orderId: docRef.id };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message || 'Failed to place order' };
  }
}

// Subscribe to real-time single order tracking
export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Order);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to order:', error);
    callback(null);
  });
}

// Subscribe to customer's order history
export function subscribeToCustomerOrders(customerId: string, callback: (orders: Order[]) => void): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef,
    where('customerId', '==', customerId)
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    // Sort descending by creation date
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (error) => {
    console.error('Error listening to customer orders:', error);
    callback([]);
  });
}

// Subscribe to unassigned available orders for delivery partners
export function subscribeToAvailableDeliveries(callback: (orders: Order[]) => void): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef,
    where('orderStatus', '==', 'placed'),
    where('deliveryPartnerId', '==', null)
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (error) => {
    console.error('Error listening to available orders:', error);
    callback([]);
  });
}

// Subscribe to assigned deliveries for a delivery partner
export function subscribeToPartnerDeliveries(partnerId: string, callback: (orders: Order[]) => void): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef,
    where('deliveryPartnerId', '==', partnerId)
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (error) => {
    console.error('Error listening to partner orders:', error);
    callback([]);
  });
}

export const subscribeToAvailableOrders = subscribeToAvailableDeliveries;
export const subscribeToDeliveryPartnerOrders = subscribeToPartnerDeliveries;

// Safe transaction to accept delivery - PREVENTS RACE CONDITIONS
export async function acceptDeliveryOrder(
  orderDocId: string, 
  partner: UserProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderDocId);

    const result = await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderSnap.data() as Order;
      
      // CRITICAL CHECK: ensure order is still unassigned and in 'placed' state
      if (orderData.deliveryPartnerId !== null || orderData.orderStatus !== 'placed') {
        throw new Error('Order has already been accepted by another delivery partner');
      }

      const now = new Date().toISOString();
      const updatedTimeline = {
        ...(orderData.statusTimeline || { placedAt: orderData.createdAt }),
        confirmedAt: now
      };

      // Assign to current partner & set status to confirmed
      transaction.update(orderRef, {
        deliveryPartnerId: partner.uid,
        deliveryPartnerName: partner.name,
        deliveryPartnerPhone: partner.phone,
        deliveryPartnerVehicle: partner.vehicleNumber || 'Eco EV Delivery',
        deliveryPartnerRating: partner.rating || 4.9,
        partnerEarnings: 55, // Base fee + distance incentive
        orderStatus: 'confirmed',
        updatedAt: now,
        statusTimeline: updatedTimeline
      });

      return { customerId: orderData.customerId, orderId: orderData.orderId };
    });

    // Notify customer
    await createNotification({
      userId: result.customerId,
      role: 'customer',
      title: 'Delivery Partner Assigned 🛵',
      message: `${partner.name} has accepted your order #${result.orderId} and will pick it up from the farm shortly.`,
      type: 'assignment',
      orderId: orderDocId,
      read: false,
      createdAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error accepting delivery order:', error);
    return { success: false, error: error.message || 'Failed to accept order' };
  }
}

// Update delivery order status step by step
export async function updateOrderStatus(
  orderDocId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderDocId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const orderData = orderSnap.data() as Order;
    const now = new Date().toISOString();
    const timeline = { ...(orderData.statusTimeline || { placedAt: orderData.createdAt }) };
    const updates: Partial<Order> = {
      orderStatus: newStatus,
      updatedAt: now
    };

    let notifTitle = '';
    let notifMessage = '';

    if (newStatus === 'picked_up') {
      timeline.pickedUpAt = now;
      updates.statusTimeline = timeline;
      notifTitle = 'Produce Picked Up from Farm 📦';
      notifMessage = `Your fresh harvest #${orderData.orderId} has been safely picked up and is on its way.`;
    } else if (newStatus === 'out_for_delivery') {
      timeline.outForDeliveryAt = now;
      updates.statusTimeline = timeline;
      notifTitle = 'Out For Delivery 🚀';
      notifMessage = `${orderData.deliveryPartnerName || 'Your delivery partner'} is on the way with your fresh farm produce!`;
    } else if (newStatus === 'delivered') {
      timeline.deliveredAt = now;
      updates.statusTimeline = timeline;
      updates.completedAt = now;
      updates.paymentStatus = 'paid';
      notifTitle = 'Order Delivered! 🌿';
      notifMessage = `Your order #${orderData.orderId} has been delivered fresh at your doorstep. Enjoy the farm-fresh goodness!`;

      // Also update delivery partner stats in users/{partnerId} if assigned
      if (orderData.deliveryPartnerId) {
        try {
          const partnerRef = doc(db, USERS_COLLECTION, orderData.deliveryPartnerId);
          const partnerSnap = await getDoc(partnerRef);
          if (partnerSnap.exists()) {
            const currentData = partnerSnap.data();
            const completed = (currentData.completedDeliveries || 0) + 1;
            const total = (currentData.totalDeliveries || 0) + 1;
            const earnings = (currentData.earnings || 0) + (orderData.partnerEarnings || 55);
            await updateDoc(partnerRef, {
              completedDeliveries: completed,
              totalDeliveries: total,
              earnings: earnings
            });
          }
        } catch (err) {
          console.warn('Could not update partner aggregate stats:', err);
        }
      }
    }

    await updateDoc(orderRef, updates);

    // Send customer notification
    if (notifTitle) {
      await createNotification({
        userId: orderData.customerId,
        role: 'customer',
        title: notifTitle,
        message: notifMessage,
        type: 'order_status',
        orderId: orderDocId,
        read: false,
        createdAt: now
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message || 'Failed to update order status' };
  }
}

export const updateOrderStatusByPartner = updateOrderStatus;
