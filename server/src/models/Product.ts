import { COLLECTIONS } from '../config/constants';

export interface IProduct {
  id?: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  farmId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  description: string;
  image?: string;
  harvestDate?: string;
  location?: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export const ProductModel = {
  collection: COLLECTIONS.AGRI_PRODUCTS,
  format: (data: any, id?: string): IProduct => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    farmerName: data.farmerName || 'Farmer',
    farmerPhone: data.farmerPhone || '',
    farmId: data.farmId || undefined,
    name: data.name || 'Organic Farm Produce',
    category: data.category || 'Vegetables',
    quantity: Number(data.quantity) || 500,
    unit: data.unit || 'KG',
    price: Number(data.price) || 40,
    description: data.description || 'Farm-fresh harvest grown with sustainable organic practices.',
    image: data.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
    harvestDate: data.harvestDate || new Date().toISOString().split('T')[0],
    location: data.location || 'Kanchipuram, TN',
    status: data.status || 'AVAILABLE',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
