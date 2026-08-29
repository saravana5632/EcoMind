export type UserRole = 'FARMER' | 'LANDLORD' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type LandStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type AreaUnit = 'Acres' | 'Hectares' | 'Cents' | 'Bigha' | 'Guntha';

export type SoilType =
  | 'Red Soil'
  | 'Black Soil'
  | 'Alluvial Soil'
  | 'Clay Soil'
  | 'Sandy Loam'
  | 'Loam Soil'
  | 'Laterite Soil';

export type WaterAvailability =
  | 'Borewell Available'
  | 'Canal Irrigation'
  | 'River Source'
  | 'Open Well'
  | 'Drip Irrigation'
  | 'Rainfed Only';

export type ElectricityAvailability =
  | '24x7 3-Phase Power'
  | '8-Hour Agricultural Power'
  | 'Solar Powered Borewell'
  | 'No Electricity';

export type RentPeriod = 'Monthly' | 'Quarterly' | 'Per Crop Season' | 'Annually';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  dob?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  photoUrl?: string;
  location: LocationCoordinates;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandDocument {
  id: string;
  title: string;
  fileType: string;
  url: string;
}

export interface LandItem {
  id: string;
  landCode: string;
  landlordId: string;
  landlordName: string;
  landlordPhone?: string;
  landlordEmail?: string;
  name: string;
  totalArea: number;
  areaUnit: AreaUnit;
  soilType: SoilType;
  waterAvailability: WaterAvailability;
  electricityAvailability: ElectricityAvailability;
  currentCrop?: string;
  previousCrop?: string;
  description: string;
  rentAmount: number;
  rentPeriod: RentPeriod;
  location: LocationCoordinates;
  images: string[];
  documents?: LandDocument[];
  status: LandStatus;
  verified: boolean;
  distanceKm?: number;
  isWithin20Km?: boolean;
  activeRentalFarmerId?: string;
  activeRentalFarmerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail: string;
  farmerLocation: LocationCoordinates;
  landId: string;
  landName: string;
  landLocation: LocationCoordinates;
  landArea: number;
  landAreaUnit: AreaUnit;
  landSoilType: SoilType;
  landlordId: string;
  landlordName: string;
  requestedDuration: string;
  requestedStartDate: string;
  requestedEndDate: string;
  purposeCrop: string;
  proposedRent: number;
  notes?: string;
  distanceKm: number;
  status: RequestStatus;
  landlordDecisionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'request';
  read: boolean;
  timestamp: string;
  linkUrl?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'USER' | 'LAND' | 'RENTAL' | 'SYSTEM';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface DashboardStatistics {
  totalFarmers: number;
  totalLandlords: number;
  totalLands: number;
  availableLands: number;
  reservedLands: number;
  rentedLands: number;
  maintenanceLands: number;
  pendingRequests: number;
  activeRentals: number;
  totalRentalValue: number;
  avgRentPerAcre: number;
  growthTrends: {
    month: string;
    farmers: number;
    landlords: number;
    rentals: number;
    revenue: number;
  }[];
  soilDistribution: {
    name: string;
    value: number;
  }[];
  regionalDistribution: {
    state: string;
    lands: number;
    farmers: number;
  }[];
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
