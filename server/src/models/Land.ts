import { COLLECTIONS, LAND_STATUS } from '../config/constants';

export interface ILand {
  id?: string;
  landCode?: string;
  landlordId: string;
  landlordName?: string;
  landlordPhone?: string;
  landName: string;
  name: string; // for UI compatibility
  description: string;
  area: number;
  totalArea: number; // for UI compatibility
  areaUnit: string;
  soilType: string;
  waterAvailability: string;
  waterSource?: string;
  electricityAvailable: boolean;
  electricityAvailability: string;
  currentCrop?: string;
  previousCrop?: string;
  suitableCrops: string[];
  rentAmount: number;
  rentPeriod: string;
  securityDeposit?: number;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  images: string[];
  documents: string[];
  status: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';
  verified: boolean;
  activeRentalRequestId?: string;
  activeFarmerId?: string;
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export const LandModel = {
  collection: COLLECTIONS.AGRI_LANDS,
  format: (data: any, id?: string): ILand => {
    const areaVal = Number(data.area || data.totalArea) || 5;
    const landTitle = data.landName || data.name || 'Fertile Farm Plot';
    return {
      id: id || data.id,
      landCode: data.landCode || `LND-${(id || '000').slice(-4).toUpperCase()}`,
      landlordId: data.landlordId || '',
      landlordName: data.landlordName || 'Verified Landowner',
      landlordPhone: data.landlordPhone || '+91 9876543210',
      landName: landTitle,
      name: landTitle,
      description: data.description || '',
      area: areaVal,
      totalArea: areaVal,
      areaUnit: data.areaUnit || 'Acres',
      soilType: data.soilType || 'Red Loam',
      waterAvailability: data.waterAvailability || 'Borewell & Canal (24/7)',
      waterSource: data.waterSource || 'Borewell & Canal',
      electricityAvailable: data.electricityAvailable ?? true,
      electricityAvailability: data.electricityAvailability || '3-Phase 8hrs/day',
      currentCrop: data.currentCrop || 'Fallow / Cleared',
      previousCrop: data.previousCrop || 'Paddy',
      suitableCrops: Array.isArray(data.suitableCrops) && data.suitableCrops.length > 0
        ? data.suitableCrops
        : ['Paddy', 'Vegetables', 'Groundnut', 'Millets'],
      rentAmount: Number(data.rentAmount) || 30000,
      rentPeriod: data.rentPeriod || 'Year',
      securityDeposit: Number(data.securityDeposit) || 10000,
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
      images: Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      documents: Array.isArray(data.documents) ? data.documents : [],
      status: data.status || LAND_STATUS.AVAILABLE,
      verified: data.verified ?? true,
      activeRentalRequestId: data.activeRentalRequestId || undefined,
      activeFarmerId: data.activeFarmerId || undefined,
      distanceKm: typeof data.distanceKm === 'number' ? data.distanceKm : undefined,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
