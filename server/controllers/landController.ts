import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { LocationService } from '../services/locationService';
import { NotificationService } from '../services/notificationService';
import { COLLECTIONS, LAND_STATUS, MAX_FARMER_LAND_DISTANCE_KM } from '../config/constants';
import { LandModel, ILand } from '../models/Land';
import { sendSuccess, sendError } from '../utils/response';

export class LandController {
  /**
   * Create a new agricultural land listing
   */
  static async createLand(req: Request, res: Response, next: NextFunction) {
    try {
      const landlordId = req.user?.id || req.user?.firebaseUid;
      if (!landlordId) return sendError(res, 'Unauthorized', 401);

      const payload = {
        ...req.body,
        landlordId,
        landlordName: req.user?.name || 'Verified Landowner',
        landlordPhone: req.user?.phone || '',
      };

      const formatted = LandModel.format(payload);
      const created = await FirebaseService.createDocument<ILand>(COLLECTIONS.AGRI_LANDS, formatted);

      return sendSuccess(res, created, 'Land listing created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get nearby agricultural lands within 20 KM radius (Core EcoMind Agri rule)
   */
  static async getNearbyLands(req: Request, res: Response, next: NextFunction) {
    try {
      const latParam = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lngParam = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

      const farmerLat = latParam ?? req.user?.latitude ?? 13.0827;
      const farmerLng = lngParam ?? req.user?.longitude ?? 80.2707;
      const maxDistance = req.query.maxDistanceKm ? parseFloat(req.query.maxDistanceKm as string) : MAX_FARMER_LAND_DISTANCE_KM;

      // Fetch all lands from Firestore
      const allLands = await FirebaseService.getCollection<ILand>(COLLECTIONS.AGRI_LANDS);

      // Compute Haversine distance and filter strictly <= 20 KM (or specified maxDistance)
      const nearbyLands = allLands
        .map((land) => {
          const landLat = typeof land.latitude === 'number' ? land.latitude : 13.0827;
          const landLng = typeof land.longitude === 'number' ? land.longitude : 80.2707;
          const distanceKm = LocationService.getDistance(farmerLat, farmerLng, landLat, landLng);
          return {
            ...land,
            distanceKm,
          };
        })
        .filter((land) => {
          // Check 20 KM radius
          if (land.distanceKm > maxDistance) return false;

          // Status filter
          if (req.query.status && land.status !== req.query.status) return false;

          // Soil filter
          if (req.query.soilType && !land.soilType?.toLowerCase().includes((req.query.soilType as string).toLowerCase())) {
            return false;
          }

          // Search filter
          if (req.query.search) {
            const term = (req.query.search as string).toLowerCase();
            const matchesName = (land.landName || land.name || '').toLowerCase().includes(term);
            const matchesDistrict = (land.district || '').toLowerCase().includes(term);
            const matchesVillage = (land.village || '').toLowerCase().includes(term);
            if (!matchesName && !matchesDistrict && !matchesVillage) return false;
          }

          return true;
        })
        .sort((a, b) => a.distanceKm - b.distanceKm); // Sort nearest first

      // Return standard response matching UI expectations
      return sendSuccess(res, {
        lands: nearbyLands,
        farmerCoordinates: { latitude: farmerLat, longitude: farmerLng },
        maxRadiusKm: maxDistance,
        totalInSystem: allLands.length,
        totalWithinRadius: nearbyLands.length,
      }, `Found ${nearbyLands.length} agricultural lands within ${maxDistance} KM`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all lands (for admin or exploration)
   */
  static async getAllLands(req: Request, res: Response, next: NextFunction) {
    try {
      const lands = await FirebaseService.getCollection<ILand>(COLLECTIONS.AGRI_LANDS);
      return sendSuccess(res, lands, 'Lands retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lands belonging to authenticated landlord
   */
  static async getMyLands(req: Request, res: Response, next: NextFunction) {
    try {
      const landlordId = req.user?.id || req.user?.firebaseUid;
      if (!landlordId) return sendError(res, 'Unauthorized', 401);

      const lands = await FirebaseService.queryCollection<ILand>(
        COLLECTIONS.AGRI_LANDS,
        [{ field: 'landlordId', operator: '==', value: landlordId }]
      );
      return sendSuccess(res, lands, 'Landlord lands retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single land by ID
   */
  static async getLandById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const land = await FirebaseService.getDocument<ILand>(COLLECTIONS.AGRI_LANDS, id);
      if (!land) return sendError(res, 'Land not found', 404, 'LAND_NOT_FOUND');

      const latParam = req.query.lat ? parseFloat(req.query.lat as string) : req.user?.latitude;
      const lngParam = req.query.lng ? parseFloat(req.query.lng as string) : req.user?.longitude;

      let distanceKm: number | undefined;
      if (typeof latParam === 'number' && typeof lngParam === 'number') {
        distanceKm = LocationService.getDistance(latParam, lngParam, land.latitude, land.longitude);
      }

      return sendSuccess(res, { ...land, distanceKm }, 'Land details retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update land listing
   */
  static async updateLand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const land = await FirebaseService.getDocument<ILand>(COLLECTIONS.AGRI_LANDS, id);
      if (!land) return sendError(res, 'Land not found', 404);

      const currentUserId = req.user?.id || req.user?.firebaseUid;
      if (land.landlordId !== currentUserId && req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized to modify this land', 403);
      }

      const updated = await FirebaseService.updateDocument<ILand>(COLLECTIONS.AGRI_LANDS, id, req.body);
      return sendSuccess(res, updated, 'Land updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete land
   */
  static async deleteLand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const land = await FirebaseService.getDocument<ILand>(COLLECTIONS.AGRI_LANDS, id);
      if (!land) return sendError(res, 'Land not found', 404);

      const currentUserId = req.user?.id || req.user?.firebaseUid;
      if (land.landlordId !== currentUserId && req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized to delete this land', 403);
      }

      await FirebaseService.deleteDocument(COLLECTIONS.AGRI_LANDS, id);
      return sendSuccess(res, { deleted: true, id }, 'Land deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update land status (AVAILABLE, RESERVED, RENTED, MAINTENANCE)
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(LAND_STATUS).includes(status)) {
        return sendError(res, 'Invalid land status value', 400);
      }

      const updated = await FirebaseService.updateDocument<ILand>(COLLECTIONS.AGRI_LANDS, id, { status });
      return sendSuccess(res, updated, `Land status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin verify land
   */
  static async verifyLand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      const updated = await FirebaseService.updateDocument<ILand>(COLLECTIONS.AGRI_LANDS, id, {
        verified: verified ?? true,
      });
      return sendSuccess(res, updated, 'Land verification status updated');
    } catch (error) {
      next(error);
    }
  }
}
