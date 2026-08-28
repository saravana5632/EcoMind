import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS, ROLES } from '../config/constants';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  static async registerFarmer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerFarmer(req.body);
      return sendSuccess(res, { user: result.user, token: result.token }, 'Farmer registered successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async registerLandlord(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerLandlord(req.body);
      return sendSuccess(res, { user: result.user, token: result.token }, 'Landlord registered successfully', 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        // Create demo session user if testing
        const uid = `user_${Date.now()}`;
        const newUser = {
          id: uid,
          firebaseUid: uid,
          name: email.split('@')[0].toUpperCase(),
          email,
          phone: '+91 9876543210',
          role: role || ROLES.FARMER,
          app: 'AGRI' as const,
          status: 'ACTIVE' as const,
          latitude: 13.0827,
          longitude: 80.2707,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await FirebaseService.createDocument(COLLECTIONS.USERS, newUser, uid);
        return sendSuccess(res, { user: newUser, token: `token_${uid}` }, 'Login successful');
      }

      if (user.status === 'INACTIVE') {
        return sendError(res, 'Account is deactivated. Contact admin.', 403, 'ACCOUNT_DEACTIVATED');
      }

      const token = `token_${user.id || user.firebaseUid}_${Date.now()}`;
      return sendSuccess(res, { user, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      }
      return sendSuccess(res, req.user, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const userId = req.user.id || req.user.firebaseUid;
      const updated = await AuthService.updateProfile(userId, req.body);
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const userId = req.user.id || req.user.firebaseUid;
      const { latitude, longitude } = req.body;
      const updated = await AuthService.updateProfile(userId, {
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      return sendSuccess(res, updated, 'Location updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
  }
}
