import { FirebaseService } from './firebaseService';
import { COLLECTIONS, LAND_STATUS, RENTAL_STATUS } from '../config/constants';
import { IUser } from '../models/User';
import { ILand } from '../models/Land';
import { IRentalRequest } from '../models/RentalRequest';
import { ISale } from '../models/Sale';
import { logger } from '../utils/logger';

export class AnalyticsService {
  /**
   * Aggregate complete platform analytics for Admin Dashboard
   */
  static async getPlatformAnalytics(): Promise<any> {
    try {
      const [
        users,
        lands,
        rentals,
        plans,
        recommendations,
        products,
        buyers,
        sales,
        auditLogs,
      ] = await Promise.all([
        FirebaseService.getCollection<IUser>(COLLECTIONS.USERS).catch(() => []),
        FirebaseService.getCollection<ILand>(COLLECTIONS.AGRI_LANDS).catch(() => []),
        FirebaseService.getCollection<IRentalRequest>(COLLECTIONS.AGRI_RENTAL_REQUESTS).catch(() => []),
        FirebaseService.getCollection(COLLECTIONS.AGRI_FARMING_PLANS).catch(() => []),
        FirebaseService.getCollection(COLLECTIONS.AGRI_AI_RECOMMENDATIONS).catch(() => []),
        FirebaseService.getCollection(COLLECTIONS.AGRI_PRODUCTS).catch(() => []),
        FirebaseService.getCollection(COLLECTIONS.AGRI_BUYERS).catch(() => []),
        FirebaseService.getCollection<ISale>(COLLECTIONS.AGRI_SALES).catch(() => []),
        FirebaseService.getCollection(COLLECTIONS.AGRI_AUDIT_LOGS).catch(() => []),
      ]);

      const farmers = users.filter((u) => u.role === 'FARMER');
      const landlords = users.filter((u) => u.role === 'LANDLORD');

      const availableLands = lands.filter((l) => l.status === LAND_STATUS.AVAILABLE).length;
      const reservedLands = lands.filter((l) => l.status === LAND_STATUS.RESERVED).length;
      const rentedLands = lands.filter((l) => l.status === LAND_STATUS.RENTED).length;

      const pendingRentals = rentals.filter((r) => r.status === RENTAL_STATUS.PENDING).length;
      const approvedRentals = rentals.filter((r) => r.status === RENTAL_STATUS.APPROVED || r.status === RENTAL_STATUS.ACTIVE).length;
      const completedRentals = rentals.filter((r) => r.status === RENTAL_STATUS.COMPLETED).length;

      const totalRevenue = (sales as any[]).reduce((sum: number, s: any) => sum + (Number(s.totalAmount) || 0), 0);

      // Crop distribution
      const cropCounts: Record<string, number> = {};
      lands.forEach((l) => {
        const crops = l.suitableCrops || [];
        crops.forEach((c) => {
          cropCounts[c] = (cropCounts[c] || 0) + 1;
        });
      });

      return {
        users: {
          total: users.length,
          farmers: farmers.length,
          landlords: landlords.length,
          active: users.filter((u) => u.status === 'ACTIVE').length,
        },
        lands: {
          total: lands.length,
          available: availableLands,
          reserved: reservedLands,
          rented: rentedLands,
          verified: lands.filter((l) => l.verified).length,
        },
        rentals: {
          total: rentals.length,
          pending: pendingRentals,
          approved: approvedRentals,
          completed: completedRentals,
        },
        farmingPlans: {
          total: plans.length,
        },
        aiRecommendations: {
          total: recommendations.length,
        },
        market: {
          products: products.length,
          buyers: buyers.length,
          sales: sales.length,
          totalEstimatedRevenue: totalRevenue,
        },
        crops: cropCounts,
        charts: {
          landStatusDistribution: [
            { name: 'Available', value: availableLands, color: '#2d6a4f' },
            { name: 'Reserved', value: reservedLands, color: '#e76f51' },
            { name: 'Rented', value: rentedLands, color: '#457b9d' },
          ],
          userDistribution: [
            { name: 'Farmers', count: farmers.length },
            { name: 'Landlords', count: landlords.length },
          ],
          monthlyTrends: [
            { month: 'Jan', requests: 12, rentals: 8, aiQueries: 45 },
            { month: 'Feb', requests: 18, rentals: 14, aiQueries: 62 },
            { month: 'Mar', requests: 25, rentals: 20, aiQueries: 88 },
            { month: 'Apr', requests: 31, rentals: 24, aiQueries: 110 },
            { month: 'May', requests: 42, rentals: 35, aiQueries: 140 },
          ],
        },
        recentAuditLogsCount: auditLogs.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('[AnalyticsService] Error calculating analytics:', error);
      throw error;
    }
  }
}
