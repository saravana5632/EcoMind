import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { WhatIfAnalysisModel, IWhatIfAnalysis } from '../models/WhatIfAnalysis';
import { sendSuccess, sendError } from '../utils/response';

export class WhatIfController {
  static async runSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid || 'demo_farmer';
      const { scenarioType, originalParams, modifiedParams, baseCrop = 'Tomato' } = req.body;

      let originalYield = 4200;
      let originalCost = 45000;
      let originalProfit = 85000;
      let scenarioYield = originalYield;
      let scenarioCost = originalCost;
      let scenarioProfit = originalProfit;
      let impactSummary = 'Scenario simulated.';
      let risk = 'Low';
      let sustainabilityScore = 88;

      if (scenarioType === 'WATER_DECREASE' || scenarioType === 'DROUGHT_RISK') {
        const reductionPercent = modifiedParams?.waterReductionPercent || 30;
        scenarioYield = Math.round(originalYield * (1 - reductionPercent * 0.007));
        scenarioCost = Math.round(originalCost * 0.9);
        scenarioProfit = Math.round(scenarioYield * 32 - scenarioCost);
        impactSummary = `Water reduction of ${reductionPercent}% decreases yield by ${Math.round(reductionPercent * 0.7)}%, but saves electricity and pumping costs.`;
        risk = 'Medium';
        sustainabilityScore = 94;
      } else if (scenarioType === 'BUDGET_INCREASE') {
        const budgetBoost = modifiedParams?.budgetIncrease || 20000;
        scenarioYield = Math.round(originalYield * 1.35);
        scenarioCost = originalCost + budgetBoost;
        scenarioProfit = Math.round(scenarioYield * 35 - scenarioCost);
        impactSummary = `Investment in hybrid seeds and precision drip increases yield by 35% and net profit by 28%.`;
        risk = 'Low';
        sustainabilityScore = 90;
      } else if (scenarioType === 'ORGANIC_TRANSITION') {
        scenarioYield = Math.round(originalYield * 0.85);
        scenarioCost = Math.round(originalCost * 0.7);
        scenarioProfit = Math.round(scenarioYield * 55 - scenarioCost); // Higher organic premium
        impactSummary = `Transitioning to organic bio-inputs lowers input costs by 30% and commands a 40% organic price premium in Chennai retail markets.`;
        risk = 'Low';
        sustainabilityScore = 98;
      } else {
        scenarioYield = Math.round(originalYield * 1.15);
        scenarioProfit = Math.round(originalProfit * 1.2);
        impactSummary = 'General scenario evaluation complete.';
      }

      const yieldDiff = Number((((scenarioYield - originalYield) / originalYield) * 100).toFixed(2));
      const costDiff = Number((((scenarioCost - originalCost) / originalCost) * 100).toFixed(2));
      const profitDiff = Number((((scenarioProfit - originalProfit) / originalProfit) * 100).toFixed(2));

      const analysisData = WhatIfAnalysisModel.format({
        farmerId,
        scenarioType: scenarioType || 'CUSTOM_SIMULATION',
        scenarioParameters: { originalParams, modifiedParams },
        originalResult: {
          crop: baseCrop,
          yieldKg: originalYield,
          costRs: originalCost,
          profitRs: originalProfit,
          waterRequirement: 'Standard',
          risk: 'Low',
          sustainabilityScore: 85,
        },
        scenarioResult: {
          crop: `${baseCrop} (${scenarioType})`,
          yieldKg: scenarioYield,
          costRs: scenarioCost,
          profitRs: scenarioProfit,
          waterRequirement: scenarioType.includes('WATER') ? 'Reduced' : 'Optimized',
          risk,
          sustainabilityScore,
        },
        difference: {
          yieldDiffPercent: yieldDiff,
          costDiffPercent: costDiff,
          profitDiffPercent: profitDiff,
          environmentalImpact: sustainabilityScore > 90 ? 'High positive ecological resilience' : 'Moderate ecological balance',
          summary: impactSummary,
        },
      });

      const saved = await FirebaseService.createDocument<IWhatIfAnalysis>(
        COLLECTIONS.AGRI_WHAT_IF_ANALYSES,
        analysisData
      );

      return sendSuccess(res, saved, 'What-If simulation completed', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const list = await FirebaseService.queryCollection<IWhatIfAnalysis>(
        COLLECTIONS.AGRI_WHAT_IF_ANALYSES,
        [{ field: 'farmerId', operator: '==', value: farmerId }]
      );
      return sendSuccess(res, list, 'What-If simulations retrieved');
    } catch (error) {
      next(error);
    }
  }
}
