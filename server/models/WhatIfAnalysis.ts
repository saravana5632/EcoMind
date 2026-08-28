import { COLLECTIONS } from '../config/constants';

export interface IWhatIfAnalysis {
  id?: string;
  farmerId: string;
  basePlanId?: string;
  scenarioType: string;
  scenarioParameters: Record<string, any>;
  originalResult: {
    crop: string;
    yieldKg: number;
    costRs: number;
    profitRs: number;
    waterRequirement: string;
    risk: string;
    sustainabilityScore: number;
  };
  scenarioResult: {
    crop: string;
    yieldKg: number;
    costRs: number;
    profitRs: number;
    waterRequirement: string;
    risk: string;
    sustainabilityScore: number;
  };
  difference: {
    yieldDiffPercent: number;
    costDiffPercent: number;
    profitDiffPercent: number;
    environmentalImpact: string;
    summary: string;
  };
  createdAt: string;
}

export const WhatIfAnalysisModel = {
  collection: COLLECTIONS.AGRI_WHAT_IF_ANALYSES,
  format: (data: any, id?: string): IWhatIfAnalysis => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    ...(data.basePlanId ? { basePlanId: data.basePlanId } : {}),
    scenarioType: data.scenarioType || 'WATER_DECREASE',
    scenarioParameters: data.scenarioParameters || {},
    originalResult: data.originalResult || {
      crop: 'Tomato',
      yieldKg: 4200,
      costRs: 45000,
      profitRs: 85000,
      waterRequirement: 'Adequate',
      risk: 'Low',
      sustainabilityScore: 88,
    },
    scenarioResult: data.scenarioResult || {
      crop: 'Tomato (Deficit Irrigated)',
      yieldKg: 3400,
      costRs: 38000,
      profitRs: 64000,
      waterRequirement: 'Low',
      risk: 'Medium',
      sustainabilityScore: 75,
    },
    difference: data.difference || {
      yieldDiffPercent: -19.05,
      costDiffPercent: -15.56,
      profitDiffPercent: -24.71,
      environmentalImpact: 'Water usage reduced by 30%, slight yield drop offset by lower energy costs',
      summary: 'Feasible with mulch and drip automation to preserve soil moisture.',
    },
    createdAt: data.createdAt || new Date().toISOString(),
  }),
};
