import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { ComparisonModel, IComparison, ICropComparisonItem } from '../models/Comparison';
import { sendSuccess, sendError } from '../utils/response';

export class ComparisonController {
  static async compareCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid || 'demo_farmer';
      const crops: string[] = Array.isArray(req.body.crops) ? req.body.crops : ['Tomato', 'Chilli', 'Spinach'];

      const cropProfiles: Record<string, ICropComparisonItem> = {
        Tomato: {
          crop: 'Tomato',
          expectedCost: 45000,
          expectedYield: 4200,
          expectedProfit: 85000,
          waterRequirement: 'Moderate',
          risk: 'Low',
          environmentalImpact: 'Positive nitrogen balance with mulch',
          sustainabilityScore: 88,
          marketDemandScore: 92,
          roiPercent: 188.8,
        },
        Chilli: {
          crop: 'Chilli',
          expectedCost: 38000,
          expectedYield: 1200,
          expectedProfit: 95000,
          waterRequirement: 'Low',
          risk: 'Medium',
          environmentalImpact: 'High pest resistance, low chemical need',
          sustainabilityScore: 91,
          marketDemandScore: 85,
          roiPercent: 250.0,
        },
        Spinach: {
          crop: 'Spinach',
          expectedCost: 22000,
          expectedYield: 3500,
          expectedProfit: 55000,
          waterRequirement: 'High',
          risk: 'Low',
          environmentalImpact: 'Short cycle, rapid soil renewal',
          sustainabilityScore: 84,
          marketDemandScore: 80,
          roiPercent: 250.0,
        },
        Paddy: {
          crop: 'Paddy',
          expectedCost: 35000,
          expectedYield: 2400,
          expectedProfit: 45000,
          waterRequirement: 'High',
          risk: 'Low',
          environmentalImpact: 'Traditional cultivation, high water demand',
          sustainabilityScore: 78,
          marketDemandScore: 95,
          roiPercent: 128.5,
        },
        Groundnut: {
          crop: 'Groundnut',
          expectedCost: 28000,
          expectedYield: 1500,
          expectedProfit: 62000,
          waterRequirement: 'Low',
          risk: 'Low',
          environmentalImpact: 'Fixes atmospheric nitrogen into soil',
          sustainabilityScore: 96,
          marketDemandScore: 88,
          roiPercent: 221.4,
        },
      };

      const results: ICropComparisonItem[] = crops.map((cropName) => {
        const found = cropProfiles[cropName] || {
          crop: cropName,
          expectedCost: 30000,
          expectedYield: 2000,
          expectedProfit: 50000,
          waterRequirement: 'Moderate',
          risk: 'Low' as const,
          environmentalImpact: 'Standard agronomic foot-print',
          sustainabilityScore: 85,
          marketDemandScore: 82,
          roiPercent: 166.6,
        };
        return found;
      });

      // Best recommendation
      const best = [...results].sort((a, b) => b.expectedProfit - a.expectedProfit)[0];

      const comparisonData = ComparisonModel.format({
        farmerId,
        crops,
        results,
        bestRecommendation: `${best.crop} yields highest expected return (₹${best.expectedProfit}) with sustainability score of ${best.sustainabilityScore}/100.`,
      });

      const saved = await FirebaseService.createDocument<IComparison>(
        COLLECTIONS.AGRI_COMPARISONS,
        comparisonData
      );

      return sendSuccess(res, saved, 'Multi-crop comparison evaluated', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const list = await FirebaseService.queryCollection<IComparison>(
        COLLECTIONS.AGRI_COMPARISONS,
        [{ field: 'farmerId', operator: '==', value: farmerId }]
      );
      return sendSuccess(res, list, 'Comparison history retrieved');
    } catch (error) {
      next(error);
    }
  }
}
