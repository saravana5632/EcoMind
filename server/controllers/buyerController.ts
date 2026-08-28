import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { LocationService } from '../services/locationService';
import { COLLECTIONS } from '../config/constants';
import { BuyerModel, IBuyer } from '../models/Buyer';
import { sendSuccess, sendError } from '../utils/response';

export class BuyerController {
  static async getNearbyBuyers(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : (req.user?.latitude || 13.0827);
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : (req.user?.longitude || 80.2707);

      const allBuyers = await FirebaseService.getCollection<IBuyer>(COLLECTIONS.AGRI_BUYERS);

      const withDistances = allBuyers.map((b) => {
        const bLat = typeof b.latitude === 'number' ? b.latitude : 13.0694;
        const bLng = typeof b.longitude === 'number' ? b.longitude : 80.1948;
        const distanceKm = LocationService.getDistance(lat, lng, bLat, bLng);
        return {
          ...b,
          distanceKm,
        };
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      return sendSuccess(res, withDistances, 'Nearby buyers retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createBuyer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = BuyerModel.format(req.body);
      const created = await FirebaseService.createDocument<IBuyer>(COLLECTIONS.AGRI_BUYERS, data);
      return sendSuccess(res, created, 'Buyer registered', 201);
    } catch (error) {
      next(error);
    }
  }
}
