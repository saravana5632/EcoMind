import { calculateDistanceKm, isWithinRadius } from '../utils/distance';
import { MAX_FARMER_LAND_DISTANCE_KM } from '../config/constants';

export class LocationService {
  /**
   * Calculate distance between two coordinates
   */
  static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return calculateDistanceKm(lat1, lon1, lat2, lon2);
  }

  /**
   * Validate if land is within the 20 KM radius limit
   */
  static isWithinPermittedRadius(
    farmerLat: number,
    farmerLon: number,
    landLat: number,
    landLon: number,
    maxRadius: number = MAX_FARMER_LAND_DISTANCE_KM
  ): boolean {
    return isWithinRadius(farmerLat, farmerLon, landLat, landLon, maxRadius);
  }

  /**
   * Geocode or format address string helper
   */
  static formatLocation(village?: string, district?: string, state?: string, pincode?: string): string {
    return [village, district, state, pincode].filter(Boolean).join(', ');
  }
}
