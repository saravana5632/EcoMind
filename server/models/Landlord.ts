import { COLLECTIONS } from '../config/constants';

export interface ILandlord {
  id?: string;
  userId: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  totalLandsCount?: number;
  profileImage?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LandlordModel = {
  collection: COLLECTIONS.AGRI_LANDLORDS,
  format: (data: any, id?: string): ILandlord => ({
    id: id || data.id || data.userId,
    userId: data.userId || data.firebaseUid || id || '',
    firebaseUid: data.firebaseUid || data.userId || id || '',
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    village: data.village || '',
    district: data.district || '',
    state: data.state || 'Tamil Nadu',
    pincode: data.pincode || '',
    latitude: typeof data.latitude === 'number' ? data.latitude : 13.0827,
    longitude: typeof data.longitude === 'number' ? data.longitude : 80.2707,
    location: {
      type: 'Point',
      coordinates: [
        typeof data.longitude === 'number' ? data.longitude : 80.2707,
        typeof data.latitude === 'number' ? data.latitude : 13.0827,
      ],
    },
    totalLandsCount: data.totalLandsCount || 0,
    profileImage: data.profileImage || '',
    verified: data.verified ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
