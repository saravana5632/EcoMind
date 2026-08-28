import { COLLECTIONS } from '../config/constants';

export interface IUser {
  id?: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  role: 'FARMER' | 'LANDLORD' | 'ADMIN';
  app: 'AGRI';
  status: 'ACTIVE' | 'INACTIVE';
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  profileImage?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserModel = {
  collection: COLLECTIONS.USERS,
  format: (data: any, id?: string): IUser => ({
    id: id || data.id || data.firebaseUid,
    firebaseUid: data.firebaseUid || id || '',
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role || 'FARMER',
    app: 'AGRI',
    status: data.status || 'ACTIVE',
    address: data.address || '',
    village: data.village || '',
    district: data.district || '',
    state: data.state || '',
    pincode: data.pincode || '',
    latitude: typeof data.latitude === 'number' ? data.latitude : 13.0827,
    longitude: typeof data.longitude === 'number' ? data.longitude : 80.2707,
    profileImage: data.profileImage || '',
    verified: data.verified ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
