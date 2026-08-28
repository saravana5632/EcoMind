export const ROLES = {
  FARMER: 'FARMER',
  LANDLORD: 'LANDLORD',
  ADMIN: 'ADMIN',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const COLLECTIONS = {
  USERS: 'users',
  AGRI_FARMERS: 'agri_farmers',
  AGRI_LANDLORDS: 'agri_landlords',
  AGRI_FARM_PROFILES: 'agri_farm_profiles',
  AGRI_LANDS: 'agri_lands',
  AGRI_RENTAL_REQUESTS: 'agri_rental_requests',
  AGRI_RESERVATIONS: 'agri_reservations',
  AGRI_FARMING_PLANS: 'agri_farming_plans',
  AGRI_AI_RECOMMENDATIONS: 'agri_ai_recommendations',
  AGRI_WHAT_IF_ANALYSES: 'agri_what_if_analyses',
  AGRI_COMPARISONS: 'agri_comparisons',
  AGRI_RESOURCES: 'agri_resources',
  AGRI_PRODUCTS: 'agri_products',
  AGRI_BUYERS: 'agri_buyers',
  AGRI_SALES: 'agri_sales',
  AGRI_NOTIFICATIONS: 'agri_notifications',
  AGRI_AUDIT_LOGS: 'agri_audit_logs',
} as const;

export const LAND_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export const RENTAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const RESERVATION_STATUS = {
  RESERVED: 'RESERVED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const MAX_FARMER_LAND_DISTANCE_KM = 20.0;
