/**
 * Haversine formula to calculate the great-circle distance between two points
 * on the Earth given their longitudes and latitudes in decimal degrees.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Rounded to 1 decimal point e.g. 7.4 km
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export const MAX_RENTAL_DISTANCE_KM = 20;

export function isWithinRentalRadius(
  farmerLat: number,
  farmerLon: number,
  landLat: number,
  landLon: number,
  maxKm: number = MAX_RENTAL_DISTANCE_KM
): { distanceKm: number; allowed: boolean } {
  const distanceKm = calculateDistanceKm(farmerLat, farmerLon, landLat, landLon);
  return {
    distanceKm,
    allowed: distanceKm <= maxKm,
  };
}
