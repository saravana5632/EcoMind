import { Router, Response } from 'express';
import { db } from '../db/dataStore';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { LandItem, SoilType, WaterAvailability, ElectricityAvailability, AreaUnit, RentPeriod, LandStatus } from '../../src/types';
import { calculateDistanceKm, MAX_RENTAL_DISTANCE_KM } from '../utils/geo';

export const landRouter = Router();

// GET /api/lands/nearby - Core 20 KM Haversine proximity query
landRouter.get('/nearby', (req: AuthenticatedRequest, res: Response) => {
  try {
    const latQuery = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lngQuery = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    let farmerLat = latQuery;
    let farmerLon = lngQuery;

    // Fallback: If no query coordinates, check if user is authenticated farmer
    if (farmerLat === undefined || farmerLon === undefined) {
      if (req.user) {
        const user = db.findUserById(req.user.id);
        if (user && user.location) {
          farmerLat = user.location.latitude;
          farmerLon = user.location.longitude;
        }
      }
    }

    // Default to Chennai/Thiruvallur regional center if completely unspecified
    if (farmerLat === undefined || farmerLon === undefined || isNaN(farmerLat) || isNaN(farmerLon)) {
      farmerLat = 13.0827;
      farmerLon = 80.2707;
    }

    const maxDistanceKm = req.query.maxDistanceKm
      ? parseFloat(req.query.maxDistanceKm as string)
      : MAX_RENTAL_DISTANCE_KM; // 20 KM default constraint

    const soilType = req.query.soilType as string;
    const waterAvailability = req.query.waterAvailability as string;
    const electricityAvailability = req.query.electricityAvailability as string;
    const maxRent = req.query.maxRent ? parseFloat(req.query.maxRent as string) : undefined;
    const minArea = req.query.minArea ? parseFloat(req.query.minArea as string) : undefined;
    const status = req.query.status as string;
    const searchQuery = req.query.search as string;
    const sortBy = req.query.sortBy as any;

    const result = db.getNearbyLandsForFarmer(farmerLat, farmerLon, {
      maxDistanceKm,
      soilType,
      waterAvailability,
      electricityAvailability,
      maxRent,
      minArea,
      status,
      searchQuery,
      sortBy,
    });

    res.json({
      success: true,
      message: `Retrieved ${result.lands.length} agricultural lands within ${maxDistanceKm} KM radius.`,
      data: {
        lands: result.lands,
        farmerCoordinates: result.farmerCoordinates,
        maxRadiusKm: maxDistanceKm,
        totalInSystem: result.totalSearched,
        totalWithinRadius: result.lands.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error searching nearby agricultural lands.',
    });
  }
});

// GET /api/lands/all - System-wide listing (Public / Admin / Search)
landRouter.get('/all', (req, res) => {
  try {
    const lands = db.getAllLands();
    const status = req.query.status as string;
    const search = req.query.search as string;

    let filtered = lands;
    if (status && status !== 'ALL') {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.soilType.toLowerCase().includes(q) ||
          (l.location.district && l.location.district.toLowerCase().includes(q)) ||
          l.landCode.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      message: 'All lands retrieved successfully',
      data: filtered,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error retrieving lands.',
    });
  }
});

// GET /api/lands/my-lands - For logged in landlord
landRouter.get('/my-lands', authenticateToken, requireRole('LANDLORD'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const lands = db.getLandsByLandlord(req.user.id);
    res.json({
      success: true,
      message: 'Landlord listings retrieved successfully',
      data: lands,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error retrieving landlord lands.',
    });
  }
});

// GET /api/lands/:id - Specific land with distance calculation
landRouter.get('/:id', (req, res) => {
  try {
    const land = db.getLandById(req.params.id);
    if (!land) {
      res.status(404).json({
        success: false,
        message: 'Agricultural land parcel not found.',
      });
      return;
    }

    const latQuery = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lngQuery = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    let distanceKm: number | undefined;
    let isWithin20Km: boolean | undefined;

    if (latQuery !== undefined && lngQuery !== undefined && !isNaN(latQuery) && !isNaN(lngQuery)) {
      distanceKm = calculateDistanceKm(latQuery, lngQuery, land.location.latitude, land.location.longitude);
      isWithin20Km = distanceKm <= MAX_RENTAL_DISTANCE_KM;
    }

    res.json({
      success: true,
      message: 'Land details retrieved',
      data: {
        ...land,
        distanceKm,
        isWithin20Km,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error retrieving land details.',
    });
  }
});

// POST /api/lands - Landlord adds agricultural land
landRouter.post('/', authenticateToken, requireRole('LANDLORD', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      name,
      totalArea,
      areaUnit,
      soilType,
      waterAvailability,
      electricityAvailability,
      currentCrop,
      previousCrop,
      description,
      rentAmount,
      rentPeriod,
      location,
      images,
      documents,
      status,
    } = req.body;

    if (!name || !totalArea || !soilType || !waterAvailability || !rentAmount || !location?.latitude || !location?.longitude) {
      res.status(400).json({
        success: false,
        message: 'Land Name, Total Area, Soil Type, Water Source, Rent Amount, and Valid GPS Coordinates are required.',
      });
      return;
    }

    const landlord = db.findUserById(req.user.id);
    const landlordName = landlord ? landlord.name : req.user.name;
    const landlordPhone = landlord ? landlord.phone : undefined;
    const landlordEmail = landlord ? landlord.email : req.user.email;

    const newLand: LandItem = {
      id: `land_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      landCode: `LL-TN-${Math.floor(1000 + Math.random() * 9000)}`,
      landlordId: req.user.id,
      landlordName,
      landlordPhone,
      landlordEmail,
      name,
      totalArea: parseFloat(totalArea),
      areaUnit: (areaUnit as AreaUnit) || 'Acres',
      soilType: (soilType as SoilType) || 'Red Soil',
      waterAvailability: (waterAvailability as WaterAvailability) || 'Borewell Available',
      electricityAvailability: (electricityAvailability as ElectricityAvailability) || '24x7 3-Phase Power',
      currentCrop: currentCrop || 'Fallow / Ready for Cultivation',
      previousCrop: previousCrop || 'Paddy & Pulses',
      description: description || 'High-fertility agricultural land with excellent soil aeration and irrigation infrastructure.',
      rentAmount: parseFloat(rentAmount),
      rentPeriod: (rentPeriod as RentPeriod) || 'Annually',
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: location.address || `${location.village || 'Rural Belt'}, ${location.district || 'Thiruvallur'}`,
        village: location.village || 'Rural Village',
        district: location.district || 'Thiruvallur',
        state: location.state || 'Tamil Nadu',
        pincode: location.pincode || '600001',
      },
      images: images && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
      ],
      documents: documents || [],
      status: (status as LandStatus) || 'AVAILABLE',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.createLand(newLand);

    res.status(201).json({
      success: true,
      message: 'Agricultural land listed successfully! Farmers within 20 KM can now discover and request it.',
      data: saved,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating land listing.',
    });
  }
});

// PUT /api/lands/:id - Update land
landRouter.put('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const land = db.getLandById(req.params.id);
    if (!land) {
      res.status(404).json({ success: false, message: 'Land not found.' });
      return;
    }

    // Check ownership or Admin role
    if (land.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Permission denied: You can only edit lands you own.',
      });
      return;
    }

    const updates = req.body;
    delete updates.id;
    delete updates.landlordId;

    const updated = db.updateLand(req.params.id, updates);
    res.json({
      success: true,
      message: 'Land listing updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating land.',
    });
  }
});

// DELETE /api/lands/:id - Delete land
landRouter.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const land = db.getLandById(req.params.id);
    if (!land) {
      res.status(404).json({ success: false, message: 'Land not found.' });
      return;
    }

    if (land.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Permission denied: You can only delete lands you own.',
      });
      return;
    }

    const deleted = db.deleteLand(req.params.id, req.user.id, req.user.name);
    res.json({
      success: true,
      message: 'Land listing deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error deleting land.',
    });
  }
});
