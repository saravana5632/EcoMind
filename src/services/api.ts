import {
  ApiResponse,
  AuthResponse,
  UserProfile,
  LandItem,
  RentalRequest,
  NotificationItem,
  AdminAuditLog,
  DashboardStatistics,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('landlink_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // --- AUTH ---
  registerFarmer: (body: any) =>
    request<AuthResponse>('/auth/register/farmer', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  registerLandlord: (body: any) =>
    request<AuthResponse>('/auth/register/landlord', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (credentials: { email: string; password: string; role?: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<UserProfile>('/auth/me'),

  updateProfile: (updates: Partial<UserProfile>) =>
    request<UserProfile>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  updateLocation: (location: any) =>
    request<UserProfile>('/auth/update-location', {
      method: 'PUT',
      body: JSON.stringify(location),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // --- LANDS ---
  getNearbyLands: (params: {
    lat: number;
    lng: number;
    maxDistanceKm?: number;
    soilType?: string;
    waterAvailability?: string;
    electricityAvailability?: string;
    maxRent?: number;
    minArea?: number;
    status?: string;
    search?: string;
    sortBy?: string;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<{
      lands: LandItem[];
      farmerCoordinates: { latitude: number; longitude: number };
      maxRadiusKm: number;
      totalInSystem: number;
      totalWithinRadius: number;
    }>(`/lands/nearby?${query.toString()}`);
  },

  getAllLands: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<LandItem[]>(`/lands/all${query ? `?${query}` : ''}`);
  },

  getMyLands: () => request<LandItem[]>('/lands/my-lands'),

  getLandById: (id: string, coords?: { lat: number; lng: number }) => {
    const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
    return request<LandItem>(`/lands/${id}${query}`);
  },

  createLand: (landData: any) =>
    request<LandItem>('/lands', {
      method: 'POST',
      body: JSON.stringify(landData),
    }),

  updateLand: (id: string, updates: Partial<LandItem>) =>
    request<LandItem>(`/lands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteLand: (id: string) =>
    request(`/lands/${id}`, {
      method: 'DELETE',
    }),

  // --- RENTALS ---
  submitRentalRequest: (data: {
    landId: string;
    requestedDuration: string;
    requestedStartDate: string;
    requestedEndDate?: string;
    purposeCrop: string;
    proposedRent?: number;
    notes?: string;
    farmerLatitude?: number;
    farmerLongitude?: number;
  }) =>
    request<RentalRequest>('/rentals/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyRequests: () => request<RentalRequest[]>('/rentals/my-requests'),

  getLandlordRequests: () => request<RentalRequest[]>('/rentals/landlord-requests'),

  approveRequest: (id: string, notes?: string) =>
    request<{ request: RentalRequest; land: LandItem }>(`/rentals/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),

  rejectRequest: (id: string, reason?: string) =>
    request<RentalRequest>(`/rentals/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  startRentalLease: (id: string) =>
    request<{ request: RentalRequest; land: LandItem }>(`/rentals/${id}/start-rental`, {
      method: 'PUT',
    }),

  completeRentalLease: (id: string) =>
    request<{ request: RentalRequest; land: LandItem }>(`/rentals/${id}/complete-rental`, {
      method: 'PUT',
    }),

  // --- NOTIFICATIONS ---
  getNotifications: () => request<NotificationItem[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request('/notifications/read-all', {
      method: 'PUT',
    }),

  // --- ADMIN ---
  getAdminStats: () => request<DashboardStatistics>('/admin/statistics'),
  getAdminFarmers: () => request<UserProfile[]>('/admin/farmers'),
  getAdminLandlords: () => request<UserProfile[]>('/admin/landlords'),
  getAdminLands: () => request<LandItem[]>('/admin/lands'),
  getAdminRentals: () => request<RentalRequest[]>('/admin/rentals'),
  getAdminAuditLogs: () => request<AdminAuditLog[]>('/admin/audit-logs'),

  updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    request<UserProfile>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  verifyLand: (id: string, verified: boolean) =>
    request<LandItem>(`/admin/lands/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verified }),
    }),

  resetDemoSeed: () =>
    request('/admin/seed/reset', {
      method: 'POST',
    }),
};
