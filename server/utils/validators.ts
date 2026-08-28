import { z } from 'zod';

export const farmerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional(),
  address: z.string().optional().default(''),
  village: z.string().optional().default(''),
  district: z.string().optional().default(''),
  state: z.string().optional().default(''),
  pincode: z.string().optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  farmSize: z.number().positive().optional().default(1),
  soilType: z.string().optional().default('Loamy'),
  waterAvailability: z.string().optional().default('Adequate'),
  budget: z.number().nonnegative().optional().default(50000),
  profileImage: z.string().optional().default(''),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});
export const farmerRegistrationSchema = farmerRegisterSchema;

export const landlordRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional(),
  address: z.string().optional().default(''),
  village: z.string().optional().default(''),
  district: z.string().optional().default(''),
  state: z.string().optional().default(''),
  pincode: z.string().optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  profileImage: z.string().optional().default(''),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});
export const landlordRegistrationSchema = landlordRegisterSchema;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['FARMER', 'LANDLORD', 'ADMIN']).optional(),
});

export const updateFarmerProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  profileImage: z.string().optional(),
});
export const updateProfileSchema = updateFarmerProfileSchema;

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export const updateFarmProfileSchema = z.object({
  farmName: z.string().optional(),
  farmSize: z.number().positive().optional(),
  farmSizeUnit: z.string().optional(),
  soilType: z.string().optional(),
  waterAvailability: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  currentCrop: z.string().optional(),
  previousCrop: z.string().optional(),
  preferredCrop: z.string().optional(),
  season: z.string().optional(),
  resources: z.array(z.string()).optional(),
  expectedInvestment: z.number().optional(),
  expectedFarmingDuration: z.string().optional(),
});

export const landSchema = z.object({
  landName: z.string().min(2, 'Land name is required'),
  name: z.string().optional(), // alias for UI compatibility
  description: z.string().optional().default(''),
  area: z.number().positive('Area must be positive'),
  totalArea: z.number().positive().optional(),
  areaUnit: z.string().optional().default('ACRE'),
  soilType: z.string().optional().default('Red Soil'),
  waterAvailability: z.string().optional().default('Borewell (24/7)'),
  waterSource: z.string().optional(),
  electricityAvailable: z.boolean().optional().default(true),
  electricityAvailability: z.string().optional().default('3-Phase 8hrs/day'),
  currentCrop: z.string().optional().default('Fallow'),
  previousCrop: z.string().optional().default('Paddy'),
  suitableCrops: z.array(z.string()).optional().default(['Paddy', 'Vegetables']),
  rentAmount: z.number().positive('Rent amount must be positive'),
  rentPeriod: z.string().optional().default('YEAR'),
  securityDeposit: z.number().optional().default(0),
  address: z.string().optional().default(''),
  village: z.string().optional().default(''),
  district: z.string().optional().default(''),
  state: z.string().optional().default('Tamil Nadu'),
  pincode: z.string().optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE']).optional().default('AVAILABLE'),
});
export const landCreationSchema = landSchema;
export const landUpdateSchema = landSchema.partial();

export const rentalRequestSchema = z.object({
  landId: z.string().min(1, 'Land ID is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  requestedStartDate: z.string().optional(),
  requestedEndDate: z.string().optional(),
  requestedDuration: z.string().optional().default('1 Year'),
  purposeCrop: z.string().optional().default('Vegetables'),
  proposedRent: z.number().optional(),
  message: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  farmerLatitude: z.number().optional(),
  farmerLongitude: z.number().optional(),
});

export const farmingPlanSchema = z.object({
  landId: z.string().optional(),
  farmSize: z.number().positive().optional().default(2),
  soil: z.string().optional().default('Red Soil'),
  water: z.string().optional().default('Moderate'),
  budget: z.number().positive().optional().default(50000),
  season: z.string().optional().default('Kharif'),
  crop: z.string().min(1, 'Crop is required'),
  expectedYield: z.number().optional(),
  expectedCost: z.number().optional(),
  expectedProfit: z.number().optional(),
  risk: z.string().optional().default('Low'),
  recommendation: z.string().optional(),
});

export const aiAnalysisSchema = z.object({
  farmSize: z.number().positive().optional().default(2),
  soilType: z.string().optional().default('Red Soil'),
  waterAvailability: z.string().optional().default('Borewell (24/7)'),
  budget: z.number().positive().optional().default(50000),
  season: z.string().optional().default('Kharif'),
  preferredCrop: z.string().optional().default('Tomato'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const whatIfSchema = z.object({
  basePlanId: z.string().optional(),
  scenarioType: z.string().optional().default('WATER_DECREASE'),
  scenarioParameters: z.record(z.string(), z.any()).optional().default({}),
  originalParams: z.any().optional(),
  modifiedParams: z.any().optional(),
  baseCrop: z.string().optional().default('Tomato'),
  currentCrop: z.string().optional().default('Tomato'),
  newCrop: z.string().optional(),
  waterChangePercent: z.number().optional(),
  landSizeChange: z.number().optional(),
  budgetChange: z.number().optional(),
});

export const comparisonSchema = z.object({
  crops: z.array(z.string()).min(2, 'Provide at least 2 crops to compare'),
  farmSize: z.number().optional().default(2),
  soilType: z.string().optional().default('Red Soil'),
  waterAvailability: z.string().optional().default('Moderate'),
  budget: z.number().optional().default(60000),
  season: z.string().optional().default('Rabi'),
});

export const resourceSchema = z.object({
  name: z.string().min(2, 'Resource name is required'),
  category: z.enum(['SEEDS', 'FERTILIZERS', 'EQUIPMENT', 'WATER', 'PESTICIDES', 'OTHER']),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1),
  pricePerUnit: z.number().positive(),
  supplier: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  contactPhone: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK']).optional().default('AVAILABLE'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().optional().default('Vegetables'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().optional().default('KG'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  harvestDate: z.string().optional(),
  location: z.string().optional().default(''),
  status: z.enum(['AVAILABLE', 'SOLD_OUT', 'INACTIVE']).optional().default('AVAILABLE'),
});

export const buyerSchema = z.object({
  name: z.string().min(2, 'Buyer name is required'),
  email: z.string().email(),
  phone: z.string().min(10),
  businessName: z.string().min(2),
  buyerType: z.enum(['WHOLESALER', 'RETAILER', 'PROCESSOR', 'EXPORTER', 'INDIVIDUAL']).default('WHOLESALER'),
  location: z.string().optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  preferredCrops: z.array(z.string()).optional().default([]),
});

export const saleSchema = z.object({
  productId: z.string().min(1),
  buyerId: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('KG'),
  price: z.number().positive(),
  totalAmount: z.number().positive(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']).default('PENDING'),
});
