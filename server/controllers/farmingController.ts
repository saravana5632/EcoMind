import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { WeatherService } from '../services/weatherService';
import { SoilService } from '../services/soilService';
import { MarketService } from '../services/marketService';
import { COLLECTIONS } from '../config/constants';
import { FarmingPlanModel, IFarmingPlan } from '../models/FarmingPlan';
import { sendSuccess, sendError } from '../utils/response';

export class FarmingController {
  static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const lat = req.user?.latitude || 13.0827;
      const lon = req.user?.longitude || 80.2707;

      const weather = await WeatherService.getWeather(lat, lon);
      const soil = SoilService.getSoilProfile(req.body.soil || 'Red Soil');
      const market = MarketService.getMarketPrice(req.body.crop || 'Tomato');

      const planData = FarmingPlanModel.format({
        ...req.body,
        farmerId,
        weatherData: weather,
        marketData: market,
        soil: soil.soilType,
      });

      const created = await FirebaseService.createDocument<IFarmingPlan>(
        COLLECTIONS.AGRI_FARMING_PLANS,
        planData
      );

      return sendSuccess(res, created, 'Farming plan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const plans = await FirebaseService.queryCollection<IFarmingPlan>(
        COLLECTIONS.AGRI_FARMING_PLANS,
        [{ field: 'farmerId', operator: '==', value: farmerId }]
      );
      return sendSuccess(res, plans, 'Farming plans retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getPlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const plan = await FirebaseService.getDocument<IFarmingPlan>(COLLECTIONS.AGRI_FARMING_PLANS, id);
      if (!plan) return sendError(res, 'Farming plan not found', 404);
      return sendSuccess(res, plan, 'Farming plan details retrieved');
    } catch (error) {
      next(error);
    }
  }
}
