import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
  static async getPlatformAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AnalyticsService.getPlatformAnalytics();
      return sendSuccess(res, stats, 'Platform analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
