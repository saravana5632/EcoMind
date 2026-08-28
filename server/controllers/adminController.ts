import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { AnalyticsService } from '../services/analyticsService';
import { COLLECTIONS } from '../config/constants';
import { IUser } from '../models/User';
import { ILand } from '../models/Land';
import { IRentalRequest } from '../models/RentalRequest';
import { AuditLogModel, IAuditLog } from '../models/AuditLog';
import { seedInitialAgriData } from '../scripts/seed';
import { sendSuccess, sendError } from '../utils/response';

export class AdminController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AnalyticsService.getPlatformAnalytics();
      return sendSuccess(res, stats, 'Admin overview metrics');
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await FirebaseService.getCollection<IUser>(COLLECTIONS.USERS);
      return sendSuccess(res, users, 'All users retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getFarmers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await FirebaseService.getCollection<IUser>(COLLECTIONS.USERS);
      const farmers = users.filter((u) => u.role === 'FARMER');
      return sendSuccess(res, farmers, 'Farmers list retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getLandlords(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await FirebaseService.getCollection<IUser>(COLLECTIONS.USERS);
      const landlords = users.filter((u) => u.role === 'LANDLORD');
      return sendSuccess(res, landlords, 'Landlords list retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async resetSeed(req: Request, res: Response, next: NextFunction) {
    try {
      // Dynamic import to run seed script
      const { seedInitialAgriData } = await import('../scripts/seed');
      await seedInitialAgriData(true);
      return sendSuccess(res, { reseeded: true }, 'Demo dataset initialized successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await FirebaseService.updateDocument<IUser>(COLLECTIONS.USERS, id, { status });

      // Record audit log
      const log = AuditLogModel.format({
        adminId: req.user?.id || 'ADMIN',
        adminEmail: req.user?.email || 'admin@ecomind.agri',
        action: 'UPDATE_USER_STATUS',
        targetType: 'USER',
        targetId: id,
        description: `Admin updated user status to ${status}`,
      });
      await FirebaseService.createDocument(COLLECTIONS.AGRI_AUDIT_LOGS, log);

      return sendSuccess(res, updated, `User status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async getAllLands(req: Request, res: Response, next: NextFunction) {
    try {
      const lands = await FirebaseService.getCollection<ILand>(COLLECTIONS.AGRI_LANDS);
      return sendSuccess(res, lands, 'All lands retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async verifyLand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      const updated = await FirebaseService.updateDocument<ILand>(COLLECTIONS.AGRI_LANDS, id, {
        verified: verified ?? true,
      });

      const log = AuditLogModel.format({
        adminId: req.user?.id || 'ADMIN',
        adminEmail: req.user?.email || 'admin@ecomind.agri',
        action: 'VERIFY_LAND',
        targetType: 'LAND',
        targetId: id,
        description: `Admin verified land listing`,
      });
      await FirebaseService.createDocument(COLLECTIONS.AGRI_AUDIT_LOGS, log);

      return sendSuccess(res, updated, 'Land verification status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getAllRentals(req: Request, res: Response, next: NextFunction) {
    try {
      const rentals = await FirebaseService.getCollection<IRentalRequest>(COLLECTIONS.AGRI_RENTAL_REQUESTS);
      return sendSuccess(res, rentals, 'All rental requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await FirebaseService.getCollection<IAuditLog>(COLLECTIONS.AGRI_AUDIT_LOGS, {
        orderByField: 'timestamp',
        orderDirection: 'desc',
        limit: 100,
      }).catch(async () => {
        return FirebaseService.getCollection<IAuditLog>(COLLECTIONS.AGRI_AUDIT_LOGS);
      });
      return sendSuccess(res, logs, 'Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}
