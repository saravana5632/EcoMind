import { Request, Response, NextFunction } from 'express';
import { RentalService } from '../services/rentalService';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { IRentalRequest } from '../models/RentalRequest';
import { sendSuccess, sendError } from '../utils/response';

export class RentalController {
  /**
   * Farmer submits rental request
   */
  static async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const result = await RentalService.requestRental(req.user, req.body);
      return sendSuccess(res, result.request, 'Rental request submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Farmer views their submitted rental requests
   */
  static async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const requests = await FirebaseService.queryCollection<IRentalRequest>(
        COLLECTIONS.AGRI_RENTAL_REQUESTS,
        [{ field: 'farmerId', operator: '==', value: farmerId }]
      );
      return sendSuccess(res, requests, 'Farmer rental requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Landlord views received rental requests
   */
  static async getLandlordRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const landlordId = req.user?.id || req.user?.firebaseUid;
      if (!landlordId) return sendError(res, 'Unauthorized', 401);

      const requests = await FirebaseService.queryCollection<IRentalRequest>(
        COLLECTIONS.AGRI_RENTAL_REQUESTS,
        [{ field: 'landlordId', operator: '==', value: landlordId }]
      );
      return sendSuccess(res, requests, 'Landlord received requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Landlord approves rental request
   */
  static async approveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const landlordId = req.user?.id || req.user?.firebaseUid;
      if (!landlordId) return sendError(res, 'Unauthorized', 401);

      const { id } = req.params;
      const { notes } = req.body;

      const result = await RentalService.approveRental(landlordId, id, notes);
      return sendSuccess(res, result, 'Rental proposal approved and land reserved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Landlord rejects rental request
   */
  static async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const landlordId = req.user?.id || req.user?.firebaseUid;
      if (!landlordId) return sendError(res, 'Unauthorized', 401);

      const { id } = req.params;
      const { reason } = req.body;

      const result = await RentalService.rejectRental(landlordId, id, reason);
      return sendSuccess(res, result, 'Rental request rejected');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start active rental lease
   */
  static async startLease(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await RentalService.startLease(id);
      return sendSuccess(res, result, 'Rental lease started');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete active rental lease
   */
  static async completeLease(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await RentalService.completeLease(id);
      return sendSuccess(res, result, 'Rental lease completed');
    } catch (error) {
      next(error);
    }
  }
}
