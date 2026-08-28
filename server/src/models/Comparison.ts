import { COLLECTIONS } from '../config/constants';

export interface ICropComparisonItem {
  crop: string;
  expectedCost: number;
  expectedYield: number;
  expectedProfit: number;
  waterRequirement: string;
  risk: 'Low' | 'Medium' | 'High';
  environmentalImpact: string;
  sustainabilityScore: number;
  marketDemandScore: number;
  roiPercent: number;
}

export interface IComparison {
  id?: string;
  farmerId: string;
  crops: string[];
  results: ICropComparisonItem[];
  bestRecommendation: string;
  createdAt: string;
}

export const ComparisonModel = {
  collection: COLLECTIONS.AGRI_COMPARISONS,
  format: (data: any, id?: string): IComparison => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    crops: Array.isArray(data.crops) ? data.crops : ['Tomato', 'Chilli', 'Spinach'],
    results: Array.isArray(data.results) ? data.results : [],
    bestRecommendation: data.bestRecommendation || 'Tomato offers the optimal profit-to-risk ratio.',
    createdAt: data.createdAt || new Date().toISOString(),
  }),
};
