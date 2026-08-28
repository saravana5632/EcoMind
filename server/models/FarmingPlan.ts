import { COLLECTIONS } from '../config/constants';

export interface IFarmingPlan {
  id?: string;
  farmerId: string;
  landId?: string;
  location?: string;
  farmSize: number;
  soil: string;
  water: string;
  budget: number;
  season: string;
  crop: string;
  weatherData?: any;
  marketData?: any;
  expectedYield?: number;
  expectedCost?: number;
  expectedProfit?: number;
  risk?: string;
  recommendation?: string;
  sustainabilityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export const FarmingPlanModel = {
  collection: COLLECTIONS.AGRI_FARMING_PLANS,
  format: (data: any, id?: string): IFarmingPlan => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    ...(data.landId ? { landId: data.landId } : {}),
    location: data.location || '',
    farmSize: Number(data.farmSize) || 2,
    soil: data.soil || data.soilType || 'Red Soil',
    water: data.water || data.waterAvailability || 'Moderate',
    budget: Number(data.budget) || 50000,
    season: data.season || 'Kharif',
    crop: data.crop || 'Tomato',
    weatherData: data.weatherData || null,
    marketData: data.marketData || null,
    expectedYield: Number(data.expectedYield) || 4500,
    expectedCost: Number(data.expectedCost) || 35000,
    expectedProfit: Number(data.expectedProfit) || 65000,
    risk: data.risk || 'Low',
    recommendation: data.recommendation || 'Optimal planting window is within the next 10 days.',
    sustainabilityScore: Number(data.sustainabilityScore) || 85,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
