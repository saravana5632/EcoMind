import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { IFarmer } from '../models/Farmer';
import { IFarmProfile, FarmProfileModel } from '../models/FarmProfile';
import { sendSuccess, sendError } from '../utils/response';

export class FarmerController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      let farmer = await FirebaseService.getDocument<IFarmer>(COLLECTIONS.AGRI_FARMERS, userId);
      if (!farmer) {
        farmer = {
          id: userId,
          userId,
          firebaseUid: userId,
          name: req.user?.name || 'Farmer',
          email: req.user?.email || '',
          phone: req.user?.phone || '',
          latitude: req.user?.latitude || 13.0827,
          longitude: req.user?.longitude || 80.2707,
          verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return sendSuccess(res, farmer, 'Farmer profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const updated = await FirebaseService.updateDocument<IFarmer>(COLLECTIONS.AGRI_FARMERS, userId, req.body);
      return sendSuccess(res, updated, 'Farmer profile updated');
    } catch (error) {
      next(error);
    }
  }

  static async getFarmProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      let farm = await FirebaseService.getDocument<IFarmProfile>(COLLECTIONS.AGRI_FARM_PROFILES, userId);
      if (!farm) {
        // Create default farm profile
        const newFarm = FarmProfileModel.format({
          farmerId: userId,
          farmName: `${req.user?.name || 'Farmer'}'s Farm`,
          latitude: req.user?.latitude || 13.0827,
          longitude: req.user?.longitude || 80.2707,
        }, userId);
        farm = await FirebaseService.createDocument<IFarmProfile>(COLLECTIONS.AGRI_FARM_PROFILES, newFarm, userId);
      }
      return sendSuccess(res, farm, 'Farm profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateFarmProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.firebaseUid;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      let updated = await FirebaseService.updateDocument<IFarmProfile>(
        COLLECTIONS.AGRI_FARM_PROFILES,
        userId,
        req.body
      );

      if (!updated) {
        const payload = FarmProfileModel.format({ ...req.body, farmerId: userId }, userId);
        updated = await FirebaseService.createDocument<IFarmProfile>(COLLECTIONS.AGRI_FARM_PROFILES, payload, userId);
      }

      return sendSuccess(res, updated, 'Farm profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
