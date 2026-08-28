import { COLLECTIONS, RENTAL_STATUS } from '../config/constants';

export interface IRentalRequest {
  id?: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  farmerEmail?: string;
  landlordId: string;
  landlordName?: string;
  landlordPhone?: string;
  landId: string;
  landName?: string;
  landCode?: string;
  landArea?: number;
  landRent?: number;
  startDate?: string;
  endDate?: string;
  requestedStartDate?: string;
  requestedEndDate?: string;
  requestedDuration?: string;
  purposeCrop?: string;
  proposedRent?: number;
  message?: string;
  notes?: string;
  distanceKm: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string;
  approvalNotes?: string;
  farmerLatitude?: number;
  farmerLongitude?: number;
  createdAt: string;
  updatedAt: string;
}

export const RentalRequestModel = {
  collection: COLLECTIONS.AGRI_RENTAL_REQUESTS,
  format: (data: any, id?: string): IRentalRequest => ({
    id: id || data.id,
    farmerId: data.farmerId || '',
    farmerName: data.farmerName || 'Registered Farmer',
    farmerPhone: data.farmerPhone || '',
    farmerEmail: data.farmerEmail || '',
    landlordId: data.landlordId || '',
    landlordName: data.landlordName || 'Landlord',
    landlordPhone: data.landlordPhone || '',
    landId: data.landId || '',
    landName: data.landName || data.landTitle || 'Agricultural Land',
    landCode: data.landCode || '',
    landArea: Number(data.landArea) || 5,
    landRent: Number(data.landRent) || 30000,
    startDate: data.startDate || data.requestedStartDate || new Date().toISOString().split('T')[0],
    endDate: data.endDate || data.requestedEndDate || '',
    requestedStartDate: data.requestedStartDate || data.startDate || new Date().toISOString().split('T')[0],
    requestedEndDate: data.requestedEndDate || data.endDate || '',
    requestedDuration: data.requestedDuration || '1 Year',
    purposeCrop: data.purposeCrop || 'Vegetables & Paddy',
    ...(typeof data.proposedRent === 'number' ? { proposedRent: data.proposedRent } : {}),
    message: data.message || data.notes || '',
    notes: data.notes || data.message || '',
    distanceKm: typeof data.distanceKm === 'number' ? data.distanceKm : 0,
    status: data.status || RENTAL_STATUS.PENDING,
    ...(data.rejectionReason ? { rejectionReason: data.rejectionReason } : {}),
    ...(data.approvalNotes ? { approvalNotes: data.approvalNotes } : {}),
    ...(typeof data.farmerLatitude === 'number' ? { farmerLatitude: data.farmerLatitude } : {}),
    ...(typeof data.farmerLongitude === 'number' ? { farmerLongitude: data.farmerLongitude } : {}),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
