import { FirebaseService } from './firebaseService';
import { COLLECTIONS, ROLES } from '../config/constants';
import { UserModel, IUser } from '../models/User';
import { FarmerModel } from '../models/Farmer';
import { LandlordModel } from '../models/Landlord';
import { FarmProfileModel } from '../models/FarmProfile';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Register a new Farmer
   */
  static async registerFarmer(data: any): Promise<{ user: IUser; token: string }> {
    const {
      name,
      email,
      phone,
      password,
      address,
      village,
      district,
      state,
      pincode,
      latitude,
      longitude,
      farmSize,
      soilType,
      waterAvailability,
      budget,
      profileImage,
    } = data;

    const firebaseUid = `farmer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const userData: IUser = UserModel.format({
      firebaseUid,
      name,
      email,
      phone,
      role: ROLES.FARMER,
      app: 'AGRI',
      status: 'ACTIVE',
      address: address || '',
      village: village || '',
      district: district || '',
      state: state || 'Tamil Nadu',
      pincode: pincode || '',
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    }, firebaseUid);

    // Save to users collection in Firestore
    await FirebaseService.createDocument(COLLECTIONS.USERS, userData, firebaseUid);

    // Save to agri_farmers collection
    const farmerData = FarmerModel.format({
      userId: firebaseUid,
      firebaseUid,
      name,
      email,
      phone,
      address: address || '',
      village: village || '',
      district: district || '',
      state: state || 'Tamil Nadu',
      pincode: pincode || '',
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      verified: true,
    }, firebaseUid);
    await FirebaseService.createDocument(COLLECTIONS.AGRI_FARMERS, farmerData, firebaseUid);

    // Save initial farm profile to agri_farm_profiles
    const farmProfileData = FarmProfileModel.format({
      farmerId: firebaseUid,
      farmName: `${name}'s Green Field`,
      location: `${village || 'Main Village'}, ${district || 'Chengalpattu'}, ${state || 'TN'}`,
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707,
      farmSize: Number(farmSize) || 2,
      farmSizeUnit: 'ACRE',
      soilType: soilType || 'Red Soil',
      waterAvailability: waterAvailability || 'Borewell (24/7)',
      budget: Number(budget) || 50000,
    }, firebaseUid);
    await FirebaseService.createDocument(COLLECTIONS.AGRI_FARM_PROFILES, farmProfileData, firebaseUid);

    const token = `token_${firebaseUid}_${Date.now()}`;
    return { user: userData, token };
  }

  /**
   * Register a new Landlord
   */
  static async registerLandlord(data: any): Promise<{ user: IUser; token: string }> {
    const {
      name,
      email,
      phone,
      password,
      address,
      village,
      district,
      state,
      pincode,
      latitude,
      longitude,
      profileImage,
    } = data;

    const firebaseUid = `landlord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const userData: IUser = UserModel.format({
      firebaseUid,
      name,
      email,
      phone,
      role: ROLES.LANDLORD,
      app: 'AGRI',
      status: 'ACTIVE',
      address: address || '',
      village: village || '',
      district: district || '',
      state: state || 'Tamil Nadu',
      pincode: pincode || '',
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    }, firebaseUid);

    await FirebaseService.createDocument(COLLECTIONS.USERS, userData, firebaseUid);

    const landlordData = LandlordModel.format({
      userId: firebaseUid,
      firebaseUid,
      name,
      email,
      phone,
      address: address || '',
      village: village || '',
      district: district || '',
      state: state || 'Tamil Nadu',
      pincode: pincode || '',
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707,
      totalLandsCount: 0,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      verified: true,
    }, firebaseUid);
    await FirebaseService.createDocument(COLLECTIONS.AGRI_LANDLORDS, landlordData, firebaseUid);

    const token = `token_${firebaseUid}_${Date.now()}`;
    return { user: userData, token };
  }

  /**
   * Find user by email or UID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    const user = await FirebaseService.getDocument<IUser>(COLLECTIONS.USERS, userId);
    return user;
  }

  /**
   * Find user by Email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    const results = await FirebaseService.queryCollection<IUser>(COLLECTIONS.USERS, [
      { field: 'email', operator: '==', value: email },
    ], { limit: 1 });

    return results[0] || null;
  }

  /**
   * Update profile
   */
  static async updateProfile(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
    const updated = await FirebaseService.updateDocument<IUser>(COLLECTIONS.USERS, userId, updates);
    if (!updated) return null;

    if (updated.role === ROLES.FARMER) {
      await FirebaseService.updateDocument(COLLECTIONS.AGRI_FARMERS, userId, updates).catch(() => {});
    } else if (updated.role === ROLES.LANDLORD) {
      await FirebaseService.updateDocument(COLLECTIONS.AGRI_LANDLORDS, userId, updates).catch(() => {});
    }

    return updated;
  }
}
