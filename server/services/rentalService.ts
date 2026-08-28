import { FirebaseService } from './firebaseService';
import { LocationService } from './locationService';
import { NotificationService } from './notificationService';
import { COLLECTIONS, LAND_STATUS, RENTAL_STATUS, RESERVATION_STATUS, MAX_FARMER_LAND_DISTANCE_KM } from '../config/constants';
import { RentalRequestModel, IRentalRequest } from '../models/RentalRequest';
import { ReservationModel, IReservation } from '../models/Reservation';
import { ILand } from '../models/Land';
import { IUser } from '../models/User';
import { logger } from '../utils/logger';

export class RentalService {
  /**
   * Submit a new rental request with strict 20 KM radius enforcement
   */
  static async requestRental(
    farmerUser: IUser,
    payload: {
      landId: string;
      requestedStartDate?: string;
      requestedEndDate?: string;
      requestedDuration?: string;
      purposeCrop?: string;
      proposedRent?: number;
      message?: string;
      farmerLatitude?: number;
      farmerLongitude?: number;
    }
  ): Promise<{ request: IRentalRequest; land: ILand; distanceKm: number }> {
    const { landId, requestedStartDate, requestedEndDate, requestedDuration, purposeCrop, proposedRent, message } = payload;

    // 1. Fetch Land
    const land = await FirebaseService.getDocument<ILand>(COLLECTIONS.AGRI_LANDS, landId);
    if (!land) {
      const err: any = new Error('Agricultural land not found.');
      err.statusCode = 404;
      err.errorCode = 'LAND_NOT_FOUND';
      throw err;
    }

    if (land.status !== LAND_STATUS.AVAILABLE) {
      const err: any = new Error(`This land is currently ${land.status.toLowerCase()} and cannot be requested for lease.`);
      err.statusCode = 400;
      err.errorCode = 'LAND_NOT_AVAILABLE';
      throw err;
    }

    // 2. Determine Farmer Coordinates
    const farmerLat = payload.farmerLatitude ?? farmerUser.latitude ?? 13.0827;
    const farmerLon = payload.farmerLongitude ?? farmerUser.longitude ?? 80.2707;

    // 3. Calculate Geographical Distance (Haversine)
    const distanceKm = LocationService.getDistance(farmerLat, farmerLon, land.latitude, land.longitude);

    // 4. CRITICAL 20 KM Enforcement Rule (Backend Authorization check)
    if (distanceKm > MAX_FARMER_LAND_DISTANCE_KM) {
      const err: any = new Error(
        `This land is located ${distanceKm} KM away, exceeding the permitted 20 KM agricultural radius.`
      );
      err.statusCode = 403;
      err.errorCode = 'OUTSIDE_PERMITTED_RADIUS';
      err.details = { distanceKm, maxAllowedKm: MAX_FARMER_LAND_DISTANCE_KM };
      throw err;
    }

    // 5. Create Rental Request
    const requestData = RentalRequestModel.format({
      farmerId: farmerUser.id || farmerUser.firebaseUid,
      farmerName: farmerUser.name,
      farmerPhone: farmerUser.phone,
      farmerEmail: farmerUser.email,
      landlordId: land.landlordId,
      landlordName: land.landlordName,
      landlordPhone: land.landlordPhone,
      landId: land.id,
      landName: land.landName || land.name,
      landCode: land.landCode,
      landArea: land.area || land.totalArea,
      landRent: land.rentAmount,
      requestedStartDate: requestedStartDate || new Date().toISOString().split('T')[0],
      requestedEndDate: requestedEndDate || '',
      requestedDuration: requestedDuration || '1 Year',
      purposeCrop: purposeCrop || 'Vegetables',
      proposedRent: proposedRent || land.rentAmount,
      message: message || '',
      distanceKm,
      status: RENTAL_STATUS.PENDING,
      farmerLatitude: farmerLat,
      farmerLongitude: farmerLon,
    });

    const created = await FirebaseService.createDocument<IRentalRequest>(
      COLLECTIONS.AGRI_RENTAL_REQUESTS,
      requestData
    );

    // 6. Notify Landlord
    await NotificationService.sendNotification({
      userId: land.landlordId,
      type: 'NEW_RENTAL_REQUEST',
      title: 'New Land Lease Request',
      message: `${farmerUser.name} submitted a lease proposal for ${land.landName || land.name} (${distanceKm} km away).`,
      relatedId: created.id,
      link: '/landlord/dashboard',
    }).catch((e) => logger.warn('[RentalService] Notification notice:', e));

    return { request: created, land, distanceKm };
  }

  /**
   * Landlord approves rental with atomic transaction to prevent double bookings
   */
  static async approveRental(
    landlordId: string,
    requestId: string,
    notes?: string
  ): Promise<{ request: IRentalRequest; land: ILand; reservation: IReservation }> {
    const request = await FirebaseService.getDocument<IRentalRequest>(COLLECTIONS.AGRI_RENTAL_REQUESTS, requestId);
    if (!request) {
      const err: any = new Error('Rental request not found.');
      err.statusCode = 404;
      throw err;
    }

    if (request.landlordId !== landlordId) {
      const err: any = new Error('Unauthorized to approve this rental request.');
      err.statusCode = 403;
      throw err;
    }

    if (request.status !== RENTAL_STATUS.PENDING) {
      const err: any = new Error(`Request is already ${request.status.toLowerCase()}.`);
      err.statusCode = 400;
      throw err;
    }

    const land = await FirebaseService.getDocument<ILand>(COLLECTIONS.AGRI_LANDS, request.landId);
    if (!land) {
      const err: any = new Error('Land not found.');
      err.statusCode = 404;
      throw err;
    }

    // Check for double booking
    if (land.status === LAND_STATUS.RENTED || land.status === LAND_STATUS.RESERVED) {
      const err: any = new Error('Land is already reserved or rented for this period.');
      err.statusCode = 409;
      err.errorCode = 'DOUBLE_BOOKING_CONFLICT';
      throw err;
    }

    // Atomic update in Firestore
    const updatedRequest = await FirebaseService.updateDocument<IRentalRequest>(
      COLLECTIONS.AGRI_RENTAL_REQUESTS,
      requestId,
      {
        status: RENTAL_STATUS.APPROVED,
        approvalNotes: notes || 'Proposal approved by landowner.',
      }
    );

    const updatedLand = await FirebaseService.updateDocument<ILand>(
      COLLECTIONS.AGRI_LANDS,
      request.landId,
      {
        status: LAND_STATUS.RESERVED,
        activeRentalRequestId: requestId,
        activeFarmerId: request.farmerId,
      }
    );

    // Create reservation document
    const resData = ReservationModel.format({
      rentalRequestId: requestId,
      farmerId: request.farmerId,
      landlordId: request.landlordId,
      landId: request.landId,
      startDate: request.requestedStartDate || new Date().toISOString().split('T')[0],
      endDate: request.requestedEndDate || '',
      rentAmount: request.proposedRent || land.rentAmount,
      status: RESERVATION_STATUS.RESERVED,
    });
    const reservation = await FirebaseService.createDocument<IReservation>(COLLECTIONS.AGRI_RESERVATIONS, resData);

    // Notify Farmer
    await NotificationService.sendNotification({
      userId: request.farmerId,
      type: 'RENTAL_APPROVED',
      title: 'Lease Request Approved!',
      message: `Your lease request for ${land.landName || land.name} has been approved by ${land.landlordName}.`,
      relatedId: requestId,
      link: '/farmer/dashboard',
    }).catch(() => {});

    return { request: updatedRequest!, land: updatedLand!, reservation };
  }

  /**
   * Landlord rejects rental request
   */
  static async rejectRental(
    landlordId: string,
    requestId: string,
    reason?: string
  ): Promise<IRentalRequest> {
    const request = await FirebaseService.getDocument<IRentalRequest>(COLLECTIONS.AGRI_RENTAL_REQUESTS, requestId);
    if (!request) {
      const err: any = new Error('Rental request not found.');
      err.statusCode = 404;
      throw err;
    }

    if (request.landlordId !== landlordId) {
      const err: any = new Error('Unauthorized to modify this rental request.');
      err.statusCode = 403;
      throw err;
    }

    const updated = await FirebaseService.updateDocument<IRentalRequest>(
      COLLECTIONS.AGRI_RENTAL_REQUESTS,
      requestId,
      {
        status: RENTAL_STATUS.REJECTED,
        rejectionReason: reason || 'Landlord declined the request.',
      }
    );

    // Notify farmer
    await NotificationService.sendNotification({
      userId: request.farmerId,
      type: 'RENTAL_REJECTED',
      title: 'Lease Request Update',
      message: `Your lease request for ${request.landName} was declined: ${reason || 'Land unavailable'}.`,
      relatedId: requestId,
    }).catch(() => {});

    return updated!;
  }

  /**
   * Start lease (transition RESERVED -> ACTIVE / RENTED)
   */
  static async startLease(requestId: string): Promise<{ request: IRentalRequest; land: ILand }> {
    const request = await FirebaseService.getDocument<IRentalRequest>(COLLECTIONS.AGRI_RENTAL_REQUESTS, requestId);
    if (!request) throw new Error('Request not found');

    const updatedRequest = await FirebaseService.updateDocument<IRentalRequest>(
      COLLECTIONS.AGRI_RENTAL_REQUESTS,
      requestId,
      { status: RENTAL_STATUS.ACTIVE }
    );

    const updatedLand = await FirebaseService.updateDocument<ILand>(
      COLLECTIONS.AGRI_LANDS,
      request.landId,
      { status: LAND_STATUS.RENTED }
    );

    return { request: updatedRequest!, land: updatedLand! };
  }

  /**
   * Complete lease (release land back to AVAILABLE)
   */
  static async completeLease(requestId: string): Promise<{ request: IRentalRequest; land: ILand }> {
    const request = await FirebaseService.getDocument<IRentalRequest>(COLLECTIONS.AGRI_RENTAL_REQUESTS, requestId);
    if (!request) throw new Error('Request not found');

    const updatedRequest = await FirebaseService.updateDocument<IRentalRequest>(
      COLLECTIONS.AGRI_RENTAL_REQUESTS,
      requestId,
      { status: RENTAL_STATUS.COMPLETED }
    );

    const updatedLand = await FirebaseService.updateDocument<ILand>(
      COLLECTIONS.AGRI_LANDS,
      request.landId,
      {
        status: LAND_STATUS.AVAILABLE,
        activeRentalRequestId: null as any,
        activeFarmerId: null as any,
      }
    );

    return { request: updatedRequest!, land: updatedLand! };
  }
}
