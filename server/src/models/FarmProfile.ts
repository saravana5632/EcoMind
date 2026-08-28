import { COLLECTIONS } from '../config/constants';

export interface IFarmProfile {
  id?: string;
  farmerId: string;
  farmName: string;
  location: string;
  latitude: number;
  longitude: number;
  farmSize: number;
  farmSizeUnit: string;
  soilType: string;
  waterAvailability: string;
  budget: number;
  currentCrop?: string;
  previousCrop?: string;
  preferredCrop?: string;
  season?: string;
  resources?: string[];
  expectedInvestment?: number;
  expectedFarmingDuration?: string;
  createdAt: string;
  updatedAt: string;
}

export const FarmProfileModel = {
  collection: COLLECTIONS.AGRI_FARM_PROFILES,
  format: (data: any, id?: string): IFarmProfile => ({
    id: id || data.id || data.farmerId,
    farmerId: data.farmerId || '',
    farmName: data.farmName || 'Primary Farm',
    location: data.location || '',
    latitude: typeof data.latitude === 'number' ? data.latitude : 13.0827,
    longitude: typeof data.longitude === 'number' ? data.longitude : 80.2707,
    farmSize: Number(data.farmSize) || 2,
    farmSizeUnit: data.farmSizeUnit || 'ACRE',
    soilType: data.soilType || 'Red Soil',
    waterAvailability: data.waterAvailability || 'Borewell (24/7)',
    budget: Number(data.budget) || 50000,
    currentCrop: data.currentCrop || 'None',
    previousCrop: data.previousCrop || 'Paddy',
    preferredCrop: data.preferredCrop || 'Tomato',
    season: data.season || 'Kharif',
    resources: Array.isArray(data.resources) ? data.resources : ['Tractor', 'Drip Irrigation'],
    expectedInvestment: Number(data.expectedInvestment) || 40000,
    expectedFarmingDuration: data.expectedFarmingDuration || '6 Months',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
