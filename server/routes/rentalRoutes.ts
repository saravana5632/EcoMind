import { Router, Response } from 'express';
import { db } from '../db/dataStore';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { RentalRequest } from '../../src/types';
import { calculateDistanceKm, MAX_RENTAL_DISTANCE_KM } from '../utils/geo';

export const rentalRouter = Router();

// POST /api/rentals/request - Farmer requests to rent agricultural land
rentalRouter.post('/request', authenticateToken, requireRole('FARMER'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      landId,
      requestedDuration,
      requestedStartDate,
      requestedEndDate,
      purposeCrop,
      proposedRent,
      notes,
      farmerLatitude,
      farmerLongitude,
    } = req.body;

    if (!landId || !requestedDuration || !requestedStartDate) {
      res.status(400).json({
        success: false,
        message: 'Land ID, requested duration, and rental start date are required.',
      });
      return;
    }

    // 1. Fetch Land from DB
    const land = db.getLandById(landId);
    if (!land) {
      res.status(404).json({
        success: false,
        message: 'Agricultural land not found.',
      });
      return;
    }

    // 2. Check Land Availability Status
    if (land.status !== 'AVAILABLE') {
      res.status(400).json({
        success: false,
        message: `This land is currently ${land.status} and cannot accept new rental reservations.`,
      });
      return;
    }

    // 3. Fetch Farmer Profile from DB
    const farmer = db.findUserById(req.user.id);
    if (!farmer) {
      res.status(404).json({ success: false, message: 'Farmer profile not found.' });
      return;
    }

    const lat = farmerLatitude ?? farmer.location.latitude;
    const lon = farmerLongitude ?? farmer.location.longitude;

    if (lat === undefined || lon === undefined) {
      res.status(400).json({
        success: false,
        message: 'Farmer GPS coordinates are required to verify 20 KM proximity.',
      });
      return;
    }

    // 4. STRICT 20 KM GEOLOCATION ENFORCEMENT ON BACKEND
    const distanceKm = calculateDistanceKm(lat, lon, land.location.latitude, land.location.longitude);

    if (distanceKm > MAX_RENTAL_DISTANCE_KM) {
      res.status(400).json({
        success: false,
        message: `RESTRICTION VIOLATION: Land is ${distanceKm} KM away, which exceeds the permitted 20 KM agricultural radius limit. Rental requests are strictly restricted to within 20 KM.`,
        data: {
          calculatedDistanceKm: distanceKm,
          maxAllowedKm: MAX_RENTAL_DISTANCE_KM,
        },
      });
      return;
    }

    // 5. Prevent Duplicate Pending Request by same farmer for same land
    const existingRequests = db.getRentalRequestsForFarmer(farmer.id);
    const hasPending = existingRequests.some((r) => r.landId === landId && r.status === 'PENDING');
    if (hasPending) {
      res.status(409).json({
        success: false,
        message: 'You already have an active pending request for this land.',
      });
      return;
    }

    // 6. Create Rental Request
    const newRequest: RentalRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerEmail: farmer.email,
      farmerLocation: farmer.location,
      landId: land.id,
      landName: land.name,
      landLocation: land.location,
      landArea: land.totalArea,
      landAreaUnit: land.areaUnit,
      landSoilType: land.soilType,
      landlordId: land.landlordId,
      landlordName: land.landlordName,
      requestedDuration: requestedDuration || '1 Year',
      requestedStartDate: requestedStartDate,
      requestedEndDate: requestedEndDate || '',
      purposeCrop: purposeCrop || 'Organic Multicrop & Vegetables',
      proposedRent: proposedRent ? parseFloat(proposedRent) : land.rentAmount,
      notes: notes || '',
      distanceKm,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.createRentalRequest(newRequest);

    res.status(201).json({
      success: true,
      message: `Rental request submitted to landlord! Land is verified within your 20 KM zone (${distanceKm} KM away).`,
      data: saved,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error submitting rental request.',
    });
  }
});

// GET /api/rentals/my-requests - Farmer views their requests
rentalRouter.get('/my-requests', authenticateToken, requireRole('FARMER'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = db.getRentalRequestsForFarmer(req.user.id);
    res.json({
      success: true,
      message: 'Rental requests retrieved successfully',
      data: requests,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error retrieving farmer requests.',
    });
  }
});

// GET /api/rentals/landlord-requests - Landlord views requests received
rentalRouter.get('/landlord-requests', authenticateToken, requireRole('LANDLORD'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = db.getRentalRequestsForLandlord(req.user.id);
    res.json({
      success: true,
      message: 'Landlord rental requests retrieved successfully',
      data: requests,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error retrieving landlord requests.',
    });
  }
});

// PUT /api/rentals/:id/approve - Landlord approves rental request -> Status becomes RESERVED
rentalRouter.put('/:id/approve', authenticateToken, requireRole('LANDLORD', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const reqItem = db.getRentalRequestById(req.params.id);
    if (!reqItem) {
      res.status(404).json({ success: false, message: 'Rental request not found.' });
      return;
    }

    if (reqItem.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Only the listing landlord can approve this request.' });
      return;
    }

    const { notes } = req.body;
    const result = db.approveRentalRequest(req.params.id, notes);

    if (!result) {
      res.status(400).json({ success: false, message: 'Could not approve request. Check if land exists.' });
      return;
    }

    res.json({
      success: true,
      message: `Rental request approved! Land status changed from AVAILABLE to RESERVED for ${result.request.farmerName}.`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error approving rental request.',
    });
  }
});

// PUT /api/rentals/:id/reject - Landlord declines request
rentalRouter.put('/:id/reject', authenticateToken, requireRole('LANDLORD', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const reqItem = db.getRentalRequestById(req.params.id);
    if (!reqItem) {
      res.status(404).json({ success: false, message: 'Rental request not found.' });
      return;
    }

    if (reqItem.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Only the listing landlord can reject this request.' });
      return;
    }

    const { reason } = req.body;
    const result = db.rejectRentalRequest(req.params.id, reason);

    res.json({
      success: true,
      message: 'Rental request declined.',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error declining rental request.',
    });
  }
});

// PUT /api/rentals/:id/start-rental - Landlord/Admin starts lease -> Status becomes RENTED
rentalRouter.put('/:id/start-rental', authenticateToken, requireRole('LANDLORD', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = db.startRentalLease(req.params.id);
    if (!result) {
      res.status(404).json({ success: false, message: 'Rental request or associated land not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Rental lease is now officially ACTIVE (Land status transitioned from RESERVED to RENTED).`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error starting rental lease.',
    });
  }
});

// PUT /api/rentals/:id/complete-rental - Lease concluded -> Land status back to AVAILABLE
rentalRouter.put('/:id/complete-rental', authenticateToken, requireRole('LANDLORD', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = db.completeRentalLease(req.params.id);
    if (!result) {
      res.status(404).json({ success: false, message: 'Rental request or associated land not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Rental completed. Land is now AVAILABLE for new nearby farmers to discover and rent.',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error concluding rental lease.',
    });
  }
});
