import { COLLECTIONS } from '../config/constants';

export interface IAIRecommendation {
  id?: string;
  farmerId: string;
  crop: string;
  plantingRecommendation: string;
  harvestRecommendation?: string;
  waterRequirement: string;
  expectedResources?: string[];
  expectedCost: number;
  expectedYield: number;
  expectedProfit: number;
  risk: 'Low' | 'Medium' | 'High';
  sustainabilityScore: number;
  weatherSummary?: string;
  soilSuitability?: string;
  marketOutlook?: string;
  createdAt: string;
}

export const AIRecommendationModel = {
  collection: COLLECTIONS.AGRI_AI_RECOMMENDATIONS,
  format: (data: any, id?: string): IAIRecommendation => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    crop: data.crop || 'Tomato',
    plantingRecommendation: data.plantingRecommendation || 'Plant within the next 7-10 days for optimal monsoon absorption',
    harvestRecommendation: data.harvestRecommendation || 'Harvest in approx 75-90 days',
    waterRequirement: data.waterRequirement || 'Moderate (Drip irrigation advised)',
    expectedResources: data.expectedResources || ['NPK 19:19:19', 'Mulching sheets', 'Bio-fertilizer'],
    expectedCost: Number(data.expectedCost) || 45000,
    expectedYield: Number(data.expectedYield) || 4200,
    expectedProfit: Number(data.expectedProfit) || 85000,
    risk: data.risk || 'Low',
    sustainabilityScore: Number(data.sustainabilityScore) || 88,
    weatherSummary: data.weatherSummary || 'Favorable rainfall expected in 2 weeks',
    soilSuitability: data.soilSuitability || 'High nitrogen retention suitable for solanaceous crops',
    marketOutlook: data.marketOutlook || 'Wholesale market demand projected to rise 15%',
    createdAt: data.createdAt || new Date().toISOString(),
  }),
};
