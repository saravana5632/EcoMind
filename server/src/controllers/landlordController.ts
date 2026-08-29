import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { ILandlord } from '../models/Landlord';
import { ILand } from '../models/Land';
import { sendSuccess, sendError } from '../utils/response';

export class LandlordController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      let landlord = await FirebaseService.getDocument<ILandlord>(COLLECTIONS.AGRI_LANDLORDS, userId);
      if (!landlord) {
        landlord = {
          id: userId,
          userId,
          firebaseUid: userId,
          name: req.user?.name || 'Landlord',
          email: req.user?.email || '',
          phone: req.user?.phone || '',
          latitude: req.user?.latitude || 13.0827,
          longitude: req.user?.longitude || 80.2707,
          verified: true,
          totalLandsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return sendSuccess(res, landlord, 'Landlord profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const updated = await FirebaseService.updateDocument<ILandlord>(COLLECTIONS.AGRI_LANDLORDS, userId, req.body);
      return sendSuccess(res, updated, 'Landlord profile updated');
    } catch (error) {
      next(error);
    }
  }

  static async getMyLands(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const lands = await FirebaseService.queryCollection<ILand>(
        COLLECTIONS.AGRI_LANDS,
        [{ field: 'landlordId', operator: '==', value: userId }]
      );
      return sendSuccess(res, lands, 'Landlord lands retrieved');
    } catch (error) {
      next(error);
    }
  }
}
