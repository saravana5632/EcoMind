import { FirebaseService } from './firebaseService';
import { AIService } from './aiService';
import { COLLECTIONS } from '../config/constants';
import { AIRecommendationModel, IAIRecommendation } from '../models/AIRecommendation';
import { FarmingPlanModel, IFarmingPlan } from '../models/FarmingPlan';
import { logger } from '../utils/logger';

export class RecommendationService {
  /**
   * Generate and persist AI recommendation for a farmer
   */
  static async generateRecommendation(farmerId: string, params: {
    farmSize: number;
    soilType: string;
    waterAvailability: string;
    budget: number;
    season: string;
    preferredCrop?: string;
    latitude: number;
    longitude: number;
  }): Promise<IAIRecommendation> {
    try {
      const aiResult = await AIService.analyzeFarmPlan(params);

      const recData = AIRecommendationModel.format({
        farmerId,
        crop: aiResult.recommendedCrop,
        plantingRecommendation: aiResult.plantingRecommendation,
        harvestRecommendation: aiResult.harvestRecommendation,
        waterRequirement: aiResult.waterRequirement,
        expectedResources: aiResult.expectedResources,
        expectedCost: aiResult.expectedCost,
        expectedYield: aiResult.expectedYield,
        expectedProfit: aiResult.expectedProfit,
        risk: aiResult.risk,
        sustainabilityScore: aiResult.sustainabilityScore,
        weatherSummary: aiResult.weatherSummary,
        soilSuitability: aiResult.soilSuitability,
        marketOutlook: aiResult.marketOutlook,
      });

      const saved = await FirebaseService.createDocument<IAIRecommendation>(
        COLLECTIONS.AGRI_AI_RECOMMENDATIONS,
        recData
      );

      // Auto-create a draft farming plan
      const planData = FarmingPlanModel.format({
        farmerId,
        farmSize: params.farmSize,
        soil: params.soilType,
        water: params.waterAvailability,
        budget: params.budget,
        season: params.season,
        crop: aiResult.recommendedCrop,
        expectedYield: aiResult.expectedYield,
        expectedCost: aiResult.expectedCost,
        expectedProfit: aiResult.expectedProfit,
        risk: aiResult.risk,
        recommendation: aiResult.plantingRecommendation,
        sustainabilityScore: aiResult.sustainabilityScore,
      });
      await FirebaseService.createDocument(COLLECTIONS.AGRI_FARMING_PLANS, planData);

      return saved;
    } catch (error) {
      logger.error('[RecommendationService] Error generating recommendation:', error);
      throw error;
    }
  }

  /**
   * Get past recommendations for farmer
   */
  static async getRecommendationsByFarmer(farmerId: string): Promise<IAIRecommendation[]> {
    return FirebaseService.queryCollection<IAIRecommendation>(
      COLLECTIONS.AGRI_AI_RECOMMENDATIONS,
      [{ field: 'farmerId', operator: '==', value: farmerId }],
      { orderByField: 'createdAt', orderDirection: 'desc', limit: 20 }
    ).catch(async () => {
      // Index fallback
      const list = await FirebaseService.queryCollection<IAIRecommendation>(
        COLLECTIONS.AGRI_AI_RECOMMENDATIONS,
        [{ field: 'farmerId', operator: '==', value: farmerId }]
      );
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  }
}
