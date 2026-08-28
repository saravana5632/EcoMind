export type UserRole = 'customer' | 'delivery_partner' | 'farmer' | 'admin' | 'landlord';

export type DeliveryPartnerStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  // Customer specific
  address?: string;
  city?: string;
  pincode?: string;
  // Delivery Partner specific
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  serviceArea?: string;
  status?: DeliveryPartnerStatus;
  isOnline?: boolean;
  rating?: number;
  completedDeliveries?: number;
  totalDeliveries?: number;
  earnings?: number;
  createdAt: string;
  updatedAt?: string;
}

export type ProductCategory = 'Fruits' | 'Vegetables' | 'Leafy Vegetables' | 'Grains';

export type ProductStatus = 'available' | 'low_stock' | 'sold_out';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in INR (₹)
  unit: string; // 'kg', 'pack', 'bunch', 'dozen'
  availableQuantity: number;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerAvatar?: string;
  location: string;
  farmName?: string;
  harvestDate: string;
  freshness: string; // e.g. "Harvested Today (5 AM)", "Fresh picked 4 hrs ago", "Grade A Organically Grown"
  image: string;
  description: string;
  status: ProductStatus;
  organicCertified?: boolean;
  nutritionFacts?: {
    calories?: string;
    shelfLife?: string;
    storageTip?: string;
  };
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  farmerName: string;
  location: string;
}

export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderId: string; // e.g. "ORD-8492"
  customerId: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  deliverySlot: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'mock_online';
  paymentStatus: 'pending' | 'paid';
  orderStatus: OrderStatus;
  deliveryPartnerId: string | null;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerVehicle?: string;
  deliveryPartnerRating?: number;
  pickupLocation?: string;
  distanceKm?: number;
  partnerEarnings?: number;
  notes?: string;
  statusTimeline?: {
    placedAt: string;
    confirmedAt?: string;
    pickedUpAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'order_status' | 'new_order' | 'assignment' | 'pickup' | 'delivery' | 'system';
  orderId?: string;
  read: boolean;
  createdAt: string;
}
