import { COLLECTIONS } from '../config/constants';

export interface ISale {
  id?: string;
  farmerId: string;
  farmerName?: string;
  productId: string;
  productName?: string;
  buyerId: string;
  buyerName?: string;
  quantity: number;
  unit: string;
  price: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export const SaleModel = {
  collection: COLLECTIONS.AGRI_SALES,
  format: (data: any, id?: string): ISale => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    farmerName: data.farmerName || 'Farmer',
    productId: data.productId || '',
    productName: data.productName || 'Agri Produce',
    buyerId: data.buyerId || '',
    buyerName: data.buyerName || 'Buyer',
    quantity: Number(data.quantity) || 100,
    unit: data.unit || 'KG',
    price: Number(data.price) || 40,
    totalAmount: Number(data.totalAmount) || 4000,
    status: data.status || 'CONFIRMED',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
