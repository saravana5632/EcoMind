import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService';
import { RecommendationService } from '../services/recommendationService';
import { WeatherService } from '../services/weatherService';
import { SoilService } from '../services/soilService';
import { MarketService } from '../services/marketService';
import { sendSuccess, sendError } from '../utils/response';

export class AIController {
  /**
   * Run AI analysis and return instant recommendation
   */
  static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        farmSize,
        soilType,
        waterAvailability,
        budget,
        season,
        preferredCrop,
        latitude,
        longitude,
      } = req.body;

      const lat = typeof latitude === 'number' ? latitude : (req.user?.latitude || 13.0827);
      const lon = typeof longitude === 'number' ? longitude : (req.user?.longitude || 80.2707);

      const result = await AIService.analyzeFarmPlan({
        farmSize: Number(farmSize) || 2,
        soilType: soilType || 'Red Soil',
        waterAvailability: waterAvailability || 'Borewell (24/7)',
        budget: Number(budget) || 50000,
        season: season || 'Kharif',
        preferredCrop: preferredCrop || 'Tomato',
        latitude: lat,
        longitude: lon,
      });

      return sendSuccess(res, result, 'AI farm analysis completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate and persist AI recommendation in Firestore
   */
  static async generateRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid || 'demo_farmer';
      const lat = typeof req.body.latitude === 'number' ? req.body.latitude : (req.user?.latitude || 13.0827);
      const lon = typeof req.body.longitude === 'number' ? req.body.longitude : (req.user?.longitude || 80.2707);

      const recommendation = await RecommendationService.generateRecommendation(farmerId, {
        farmSize: Number(req.body.farmSize) || 2,
        soilType: req.body.soilType || 'Red Soil',
        waterAvailability: req.body.waterAvailability || 'Borewell (24/7)',
        budget: Number(req.body.budget) || 50000,
        season: req.body.season || 'Kharif',
        preferredCrop: req.body.preferredCrop || 'Tomato',
        latitude: lat,
        longitude: lon,
      });

      return sendSuccess(res, recommendation, 'AI recommendation generated and saved', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get past recommendations
   */
  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const recs = await RecommendationService.getRecommendationsByFarmer(farmerId);
      return sendSuccess(res, recs, 'AI recommendations retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Live weather endpoint
   */
  static async getWeather(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : (req.user?.latitude || 13.0827);
      const lon = req.query.lng ? parseFloat(req.query.lng as string) : (req.user?.longitude || 80.2707);

      const weather = await WeatherService.getWeather(lat, lon);
      return sendSuccess(res, weather, 'Live weather retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soil health metrics endpoint
   */
  static async getSoil(req: Request, res: Response, next: NextFunction) {
    try {
      const soilType = (req.query.soilType as string) || 'Red Soil';
      const water = (req.query.water as string) || 'Borewell (24/7)';
      const soil = SoilService.getSoilProfile(soilType, water);
      return sendSuccess(res, soil, 'Soil analysis retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Market mandi price endpoint
   */
  static async getMarket(req: Request, res: Response, next: NextFunction) {
    try {
      const crop = (req.query.crop as string) || 'Tomato';
      const location = (req.query.location as string) || 'Koyambedu Mandi';
      const market = MarketService.getMarketPrice(crop, location);
      return sendSuccess(res, market, 'Mandi market price retrieved');
    } catch (error) {
      next(error);
    }
  }
}
