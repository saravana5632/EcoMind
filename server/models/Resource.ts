import { COLLECTIONS } from '../config/constants';

export interface IResource {
  id?: string;
  name: string;
  category: 'SEEDS' | 'FERTILIZERS' | 'EQUIPMENT' | 'WATER' | 'PESTICIDES' | 'OTHER';
  quantity: number;
  unit: string;
  pricePerUnit: number;
  supplier?: string;
  description?: string;
  location?: string;
  contactPhone?: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
}

export const ResourceModel = {
  collection: COLLECTIONS.AGRI_RESOURCES,
  format: (data: any, id?: string): IResource => ({
    id: id || data.id,
    name: data.name || '',
    category: data.category || 'SEEDS',
    quantity: Number(data.quantity) || 100,
    unit: data.unit || 'KG',
    pricePerUnit: Number(data.pricePerUnit) || 120,
    supplier: data.supplier || 'AgriPro Supplies',
    description: data.description || '',
    location: data.location || 'Chennai Agri Hub',
    contactPhone: data.contactPhone || '+91 9840123456',
    status: data.status || 'AVAILABLE',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
