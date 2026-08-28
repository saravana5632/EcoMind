import { COLLECTIONS, RESERVATION_STATUS } from '../config/constants';

export interface IReservation {
  id?: string;
  rentalRequestId: string;
  farmerId: string;
  landlordId: string;
  landId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: 'RESERVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export const ReservationModel = {
  collection: COLLECTIONS.AGRI_RESERVATIONS,
  format: (data: any, id?: string): IReservation => ({
    id: id || data.id,
    rentalRequestId: data.rentalRequestId || '',
    farmerId: data.farmerId || '',
    landlordId: data.landlordId || '',
    landId: data.landId || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    rentAmount: Number(data.rentAmount) || 0,
    status: data.status || RESERVATION_STATUS.RESERVED,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
