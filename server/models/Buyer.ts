import { COLLECTIONS } from '../config/constants';

export interface IBuyer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  location: string;
  latitude: number;
  longitude: number;
  buyerType: 'WHOLESALER' | 'RETAILER' | 'PROCESSOR' | 'EXPORTER' | 'INDIVIDUAL';
  preferredCrops: string[];
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export const BuyerModel = {
  collection: COLLECTIONS.AGRI_BUYERS,
  format: (data: any, id?: string): IBuyer => ({
    id: id || data.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    businessName: data.businessName || 'Agri Wholesale Market',
    location: data.location || 'Koyambedu Wholesale Market, Chennai',
    latitude: typeof data.latitude === 'number' ? data.latitude : 13.0694,
    longitude: typeof data.longitude === 'number' ? data.longitude : 80.1948,
    buyerType: data.buyerType || 'WHOLESALER',
    preferredCrops: Array.isArray(data.preferredCrops) ? data.preferredCrops : ['Tomato', 'Paddy', 'Chilli', 'Brinjal'],
    ...(typeof data.distanceKm === 'number' ? { distanceKm: data.distanceKm } : {}),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
