import bcrypt from 'bcryptjs';
import {
  UserProfile,
  LandItem,
  RentalRequest,
  NotificationItem,
  AdminAuditLog,
  DashboardStatistics,
} from '../../src/types';
import { calculateDistanceKm, MAX_RENTAL_DISTANCE_KM } from '../utils/geo';

interface UserRecord extends UserProfile {
  passwordHash: string;
}

class DataStore {
  private users: Map<string, UserRecord> = new Map();
  private lands: Map<string, LandItem> = new Map();
  private rentalRequests: Map<string, RentalRequest> = new Map();
  private notifications: NotificationItem[] = [];
  private auditLogs: AdminAuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);
    const farmerHash = bcrypt.hashSync('farmer123', salt);
    const landlordHash = bcrypt.hashSync('landlord123', salt);

    // 1. ADMIN USER
    const adminUser: UserRecord = {
      id: 'usr_admin_01',
      name: 'Dr. Anand Ramanathan',
      email: 'admin@landlink.com',
      phone: '+91 98401 23456',
      role: 'ADMIN',
      status: 'ACTIVE',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      location: {
        latitude: 13.0827,
        longitude: 80.2707,
        address: 'National Agri-Tech Innovation Tower, Mount Road',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600002',
      },
      bio: 'Lead Administrator & Agricultural Systems Director at LandLink Platform.',
      createdAt: '2025-01-10T08:00:00.000Z',
      updatedAt: '2025-01-10T08:00:00.000Z',
      passwordHash: adminHash,
    };
    this.users.set(adminUser.id, adminUser);

    // 2. PRIMARY FARMER (Arun Kumar)
    const farmerUser: UserRecord = {
      id: 'usr_farmer_01',
      name: 'Arun Kumar',
      email: 'farmer@landlink.com',
      phone: '+91 98765 43210',
      role: 'FARMER',
      status: 'ACTIVE',
      dob: '1992-06-15',
      address: 'Plot 14, Kaveri Nagar, Red Hills Road',
      village: 'Puzhal',
      district: 'Thiruvallur',
      state: 'Tamil Nadu',
      pincode: '600066',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      location: {
        latitude: 13.0827,
        longitude: 80.2707,
        address: 'Puzhal-Red Hills Agricultural Corridor',
        village: 'Puzhal',
        district: 'Thiruvallur',
        state: 'Tamil Nadu',
        pincode: '600066',
      },
      bio: 'Progressive organic farmer with 8+ years experience in multi-cropping, drip irrigation vegetables, and heirloom paddy.',
      createdAt: '2025-02-01T10:30:00.000Z',
      updatedAt: '2025-02-01T10:30:00.000Z',
      passwordHash: farmerHash,
    };
    this.users.set(farmerUser.id, farmerUser);

    // 3. SECONDARY FARMER (Selvamani)
    const farmerUser2: UserRecord = {
      id: 'usr_farmer_02',
      name: 'Selvamani Veerappan',
      email: 'selvamani@farmtech.in',
      phone: '+91 98412 88765',
      role: 'FARMER',
      status: 'ACTIVE',
      dob: '1988-11-20',
      address: '22, Erikarai Street',
      village: 'Poonamallee',
      district: 'Thiruvallur',
      state: 'Tamil Nadu',
      pincode: '600056',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      location: {
        latitude: 13.0489,
        longitude: 80.1114,
        address: 'Poonamallee Agricultural Belt',
        village: 'Poonamallee',
        district: 'Thiruvallur',
        state: 'Tamil Nadu',
        pincode: '600056',
      },
      bio: 'Specialist in horticulture and hydroponic greenhouse cultivation.',
      createdAt: '2025-02-10T11:00:00.000Z',
      updatedAt: '2025-02-10T11:00:00.000Z',
      passwordHash: farmerHash,
    };
    this.users.set(farmerUser2.id, farmerUser2);

    // 4. PRIMARY LANDLORD (Rajesh Patel)
    const landlordUser: UserRecord = {
      id: 'usr_landlord_01',
      name: 'Rajesh Sundaram Patel',
      email: 'landlord@landlink.com',
      phone: '+91 94440 55123',
      role: 'LANDLORD',
      status: 'ACTIVE',
      address: 'Farmhouse Estate, Bypass Road',
      village: 'Avadi Rural',
      district: 'Thiruvallur',
      state: 'Tamil Nadu',
      pincode: '600054',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      location: {
        latitude: 13.1147,
        longitude: 80.0983,
        address: 'Avadi Rural Farms',
        village: 'Avadi',
        district: 'Thiruvallur',
        state: 'Tamil Nadu',
        pincode: '600054',
      },
      bio: 'Family agricultural estate owner leasing fertile acreage with active borewells, solar pumps, and fenced perimeters.',
      createdAt: '2025-01-20T09:15:00.000Z',
      updatedAt: '2025-01-20T09:15:00.000Z',
      passwordHash: landlordHash,
    };
    this.users.set(landlordUser.id, landlordUser);

    // 5. SECONDARY LANDLORD (Meenakshi Sundaram)
    const landlordUser2: UserRecord = {
      id: 'usr_landlord_02',
      name: 'Meenakshi Sundaram',
      email: 'meenakshi@agriholdings.org',
      phone: '+91 94432 99881',
      role: 'LANDLORD',
      status: 'ACTIVE',
      address: '77 Temple View Groves',
      village: 'Sriperumbudur Rural',
      district: 'Kanchipuram',
      state: 'Tamil Nadu',
      pincode: '602105',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      location: {
        latitude: 12.9691,
        longitude: 79.9482,
        address: 'Sriperumbudur Green Acreage',
        village: 'Sriperumbudur',
        district: 'Kanchipuram',
        state: 'Tamil Nadu',
        pincode: '602105',
      },
      bio: 'Owner of multi-generational fertile black-soil tracts suitable for pulses, groundnuts, and cash crops.',
      createdAt: '2025-01-25T14:20:00.000Z',
      updatedAt: '2025-01-25T14:20:00.000Z',
      passwordHash: landlordHash,
    };
    this.users.set(landlordUser2.id, landlordUser2);

    // SEED LANDS
    // Notice coordinates are chosen carefully relative to Arun Kumar at (13.0827, 80.2707):
    const sampleLands: LandItem[] = [
      {
        id: 'land_01',
        landCode: 'LL-TN-8801',
        landlordId: 'usr_landlord_01',
        landlordName: 'Rajesh Sundaram Patel',
        landlordPhone: '+91 94440 55123',
        landlordEmail: 'landlord@landlink.com',
        name: 'Green Valley Fertile Acres',
        totalArea: 5,
        areaUnit: 'Acres',
        soilType: 'Red Soil',
        waterAvailability: 'Borewell Available',
        electricityAvailability: '24x7 3-Phase Power',
        currentCrop: 'Fallow / Ready for Sowing',
        previousCrop: 'Organic Maize & Vegetables',
        description: 'Pristine 5-acre agricultural plot with deep rich red loam soil, two high-yield borewells (320 ft), full drip irrigation pipeline, solar fence, and direct paved tractor access.',
        rentAmount: 32000,
        rentPeriod: 'Annually',
        location: {
          latitude: 13.1182,
          longitude: 80.2291,
          address: 'Red Hills Agricultural Corridor, Thiruvallur Highway',
          village: 'Padiyanallur',
          district: 'Thiruvallur',
          state: 'Tamil Nadu',
          pincode: '600052',
        },
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80',
        ],
        documents: [
          { id: 'doc_1', title: 'Patta & Chitta Land Ownership Certificate', fileType: 'PDF', url: '#' },
          { id: 'doc_2', title: 'Soil Fertility & pH Test Report (pH 6.8)', fileType: 'PDF', url: '#' },
        ],
        status: 'AVAILABLE',
        verified: true,
        createdAt: '2025-02-05T09:00:00.000Z',
        updatedAt: '2025-02-05T09:00:00.000Z',
      },
      {
        id: 'land_02',
        landCode: 'LL-TN-8802',
        landlordId: 'usr_landlord_01',
        landlordName: 'Rajesh Sundaram Patel',
        landlordPhone: '+91 94440 55123',
        landlordEmail: 'landlord@landlink.com',
        name: 'Krishna River Basin Alluvial Tract',
        totalArea: 8.5,
        areaUnit: 'Acres',
        soilType: 'Alluvial Soil',
        waterAvailability: 'Canal Irrigation',
        electricityAvailability: '8-Hour Agricultural Power',
        currentCrop: 'Ready for Next Cycle',
        previousCrop: 'Traditional Ponni Paddy',
        description: 'Prime alluvial river-fed land yielding exceptional paddy and sugarcane harvests. Government sub-canal runs along the northern boundary. Fully levelled with bund protection.',
        rentAmount: 48000,
        rentPeriod: 'Annually',
        location: {
          latitude: 13.1492,
          longitude: 80.2014,
          address: 'Karanodai Canal Bank Road',
          village: 'Karanodai',
          district: 'Thiruvallur',
          state: 'Tamil Nadu',
          pincode: '600067',
        },
        images: [
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
        ],
        documents: [
          { id: 'doc_3', title: 'Canal Water Allocation Permit', fileType: 'PDF', url: '#' },
        ],
        status: 'AVAILABLE',
        verified: true,
        createdAt: '2025-02-08T10:00:00.000Z',
        updatedAt: '2025-02-08T10:00:00.000Z',
      },
      {
        id: 'land_03',
        landCode: 'LL-TN-8803',
        landlordId: 'usr_landlord_02',
        landlordName: 'Meenakshi Sundaram',
        landlordPhone: '+91 94432 99881',
        landlordEmail: 'meenakshi@agriholdings.org',
        name: 'Poonamallee Black Cotton Fields',
        totalArea: 4,
        areaUnit: 'Acres',
        soilType: 'Black Soil',
        waterAvailability: 'Borewell Available',
        electricityAvailability: '24x7 3-Phase Power',
        currentCrop: 'Vegetable Beds',
        previousCrop: 'Cotton & Groundnut',
        description: 'High nutrient water-retentive deep black soil ideal for cash crops, cotton, pulses, and organic vegetables. Features 7.5 HP electric motor with automatic timer.',
        rentAmount: 38000,
        rentPeriod: 'Annually',
        location: {
          latitude: 13.0450,
          longitude: 80.1450,
          address: 'Mangadu Agricultural Link Way',
          village: 'Mangadu',
          district: 'Thiruvallur',
          state: 'Tamil Nadu',
          pincode: '600122',
        },
        images: [
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'AVAILABLE',
        verified: true,
        createdAt: '2025-02-12T14:30:00.000Z',
        updatedAt: '2025-02-12T14:30:00.000Z',
      },
      {
        id: 'land_04',
        landCode: 'LL-TN-8804',
        landlordId: 'usr_landlord_01',
        landlordName: 'Rajesh Sundaram Patel',
        landlordPhone: '+91 94440 55123',
        landlordEmail: 'landlord@landlink.com',
        name: 'Avadi Sunshine Farmstead',
        totalArea: 6,
        areaUnit: 'Acres',
        soilType: 'Loam Soil',
        waterAvailability: 'Drip Irrigation',
        electricityAvailability: 'Solar Powered Borewell',
        currentCrop: 'Ready for Lease',
        previousCrop: 'Watermelon & Muskmelon',
        description: 'Ready-to-farm modern layout with solar-powered pump (5 kW), pre-installed automated drip lines across 6 acres, farmhouse storage shed for agricultural tools.',
        rentAmount: 42000,
        rentPeriod: 'Annually',
        location: {
          latitude: 13.1250,
          longitude: 80.1150,
          address: 'Morai Village Farm Belt',
          village: 'Morai',
          district: 'Thiruvallur',
          state: 'Tamil Nadu',
          pincode: '600055',
        },
        images: [
          'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'RESERVED',
        verified: true,
        activeRentalFarmerId: 'usr_farmer_02',
        activeRentalFarmerName: 'Selvamani Veerappan',
        createdAt: '2025-01-15T08:20:00.000Z',
        updatedAt: '2025-02-20T11:00:00.000Z',
      },
      {
        id: 'land_05',
        landCode: 'LL-TN-8805',
        landlordId: 'usr_landlord_01',
        landlordName: 'Rajesh Sundaram Patel',
        landlordPhone: '+91 94440 55123',
        landlordEmail: 'landlord@landlink.com',
        name: 'Chembarambakkam Lake Agro Belt',
        totalArea: 12,
        areaUnit: 'Acres',
        soilType: 'Clay Soil',
        waterAvailability: 'Open Well',
        electricityAvailability: '24x7 3-Phase Power',
        currentCrop: 'Paddy Seedlings',
        previousCrop: 'Paddy (CR1009 Sub 1)',
        description: 'Expansive 12-acre parcel bordering freshwater catchment zone. Superb ground water table at 25 feet depth. Two open irrigation wells and concrete water distribution channels.',
        rentAmount: 65000,
        rentPeriod: 'Annually',
        location: {
          latitude: 13.0110,
          longitude: 80.0520,
          address: 'Chembarambakkam Catchment Zone',
          village: 'Chembarambakkam',
          district: 'Thiruvallur',
          state: 'Tamil Nadu',
          pincode: '600123',
        },
        images: [
          'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'RENTED',
        verified: true,
        createdAt: '2025-01-10T12:00:00.000Z',
        updatedAt: '2025-02-18T16:00:00.000Z',
      },
      {
        id: 'land_06',
        landCode: 'LL-TN-8806',
        landlordId: 'usr_landlord_02',
        landlordName: 'Meenakshi Sundaram',
        landlordPhone: '+91 94432 99881',
        landlordEmail: 'meenakshi@agriholdings.org',
        name: 'Minjur Coastal Agro Plantation',
        totalArea: 7,
        areaUnit: 'Acres',
        soilType: 'Sandy Loam',
        waterAvailability: 'Borewell Available',
        electricityAvailability: '8-Hour Agricultural Power',
        currentCrop: 'Ready for Sowing',
        previousCrop: 'Casuarina & Groundnut',
        description: 'Sandy loam terrain highly adapted to cashews, groundnuts, watermelon, dragon fruit, and drumsticks. Fenced with concrete posts and barbed wire.',
        rentAmount: 26000,
        rentPeriod: 'Annually',
        location: {
          latitude: 13.2680,
          longitude: 80.2580,
          address: 'Minjur Rural Agricultural Circle',
          village: 'Minjur',
          district: 'Thiruvallur',
          state: 'Tamil Nadu',
          pincode: '601203',
        },
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'AVAILABLE',
        verified: true,
        createdAt: '2025-02-14T09:30:00.000Z',
        updatedAt: '2025-02-14T09:30:00.000Z',
      },

      // --- OUTSIDE 20 KM LANDS (To demonstrate and verify the 20 KM restriction!) ---
      {
        id: 'land_07',
        landCode: 'LL-TN-9901',
        landlordId: 'usr_landlord_02',
        landlordName: 'Meenakshi Sundaram',
        landlordPhone: '+91 94432 99881',
        landlordEmail: 'meenakshi@agriholdings.org',
        name: 'Kanchipuram Silk Land Estate',
        totalArea: 15,
        areaUnit: 'Acres',
        soilType: 'Alluvial Soil',
        waterAvailability: 'Canal Irrigation',
        electricityAvailability: '24x7 3-Phase Power',
        currentCrop: 'Fallow',
        previousCrop: 'Mulberry & Sugarcane',
        description: 'Extensive multi-crop farming parcel in Kanchipuram district (~65 km from Chennai). Rich black-alluvial soil with perennial canal feeder.',
        rentAmount: 75000,
        rentPeriod: 'Annually',
        location: {
          latitude: 12.8342,
          longitude: 79.7036,
          address: 'Walajabad Link Road',
          village: 'Walajabad',
          district: 'Kanchipuram',
          state: 'Tamil Nadu',
          pincode: '631605',
        },
        images: [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'AVAILABLE',
        verified: true,
        createdAt: '2025-01-28T10:00:00.000Z',
        updatedAt: '2025-01-28T10:00:00.000Z',
      },
      {
        id: 'land_08',
        landCode: 'LL-TN-9902',
        landlordId: 'usr_landlord_02',
        landlordName: 'Meenakshi Sundaram',
        landlordPhone: '+91 94432 99881',
        landlordEmail: 'meenakshi@agriholdings.org',
        name: 'Maduranthakam Lake View Agro Land',
        totalArea: 10,
        areaUnit: 'Acres',
        soilType: 'Red Soil',
        waterAvailability: 'River Source',
        electricityAvailability: 'Solar Powered Borewell',
        currentCrop: 'Fallow',
        previousCrop: 'Paddy & Pulses',
        description: 'Lakeside agricultural holding in Chengalpattu district (~82 km away from central Chennai). Perfect for large scale commercial cultivation.',
        rentAmount: 50000,
        rentPeriod: 'Annually',
        location: {
          latitude: 12.5085,
          longitude: 79.8841,
          address: 'Maduranthakam Lake Embankment',
          village: 'Maduranthakam',
          district: 'Chengalpattu',
          state: 'Tamil Nadu',
          pincode: '603306',
        },
        images: [
          'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'AVAILABLE',
        verified: false,
        createdAt: '2025-02-01T15:00:00.000Z',
        updatedAt: '2025-02-01T15:00:00.000Z',
      },
    ];

    sampleLands.forEach((land) => this.lands.set(land.id, land));

    // SEED RENTAL REQUESTS
    const initialRequests: RentalRequest[] = [
      {
        id: 'req_01',
        farmerId: 'usr_farmer_01',
        farmerName: 'Arun Kumar',
        farmerPhone: '+91 98765 43210',
        farmerEmail: 'farmer@landlink.com',
        farmerLocation: farmerUser.location,
        landId: 'land_01',
        landName: 'Green Valley Fertile Acres',
        landLocation: sampleLands[0].location,
        landArea: 5,
        landAreaUnit: 'Acres',
        landSoilType: 'Red Soil',
        landlordId: 'usr_landlord_01',
        landlordName: 'Rajesh Sundaram Patel',
        requestedDuration: '1 Year',
        requestedStartDate: '2025-03-15',
        requestedEndDate: '2026-03-14',
        purposeCrop: 'Organic Vegetable Cultivation & Pulses',
        proposedRent: 32000,
        notes: 'Seeking 1-year renewable lease. Will employ modern micro-drip methods with bio-fertilizers only.',
        distanceKm: 6.2,
        status: 'PENDING',
        createdAt: '2025-02-25T10:15:00.000Z',
        updatedAt: '2025-02-25T10:15:00.000Z',
      },
      {
        id: 'req_02',
        farmerId: 'usr_farmer_02',
        farmerName: 'Selvamani Veerappan',
        farmerPhone: '+91 98412 88765',
        farmerEmail: 'selvamani@farmtech.in',
        farmerLocation: farmerUser2.location,
        landId: 'land_04',
        landName: 'Avadi Sunshine Farmstead',
        landLocation: sampleLands[3].location,
        landArea: 6,
        landAreaUnit: 'Acres',
        landSoilType: 'Loam Soil',
        landlordId: 'usr_landlord_01',
        landlordName: 'Rajesh Sundaram Patel',
        requestedDuration: '2 Years',
        requestedStartDate: '2025-02-01',
        requestedEndDate: '2027-01-31',
        purposeCrop: 'Commercial Horticulture & Greenhouse Tomatoes',
        proposedRent: 42000,
        notes: 'Agreed on upfront bi-annual advance payment. Drip infrastructure verified.',
        distanceKm: 8.5,
        status: 'APPROVED',
        landlordDecisionNotes: 'Approved based on farmer track record and verified bank credentials.',
        createdAt: '2025-01-22T11:00:00.000Z',
        updatedAt: '2025-01-24T16:00:00.000Z',
      },
    ];

    initialRequests.forEach((req) => this.rentalRequests.set(req.id, req));

    // SEED NOTIFICATIONS
    this.notifications = [
      {
        id: 'notif_01',
        userId: 'usr_farmer_01',
        role: 'FARMER',
        title: '🌱 New Land Listed Nearby (6.2 KM)',
        message: 'Rajesh Sundaram Patel has listed "Green Valley Fertile Acres" within your 20 KM radius.',
        type: 'info',
        read: false,
        timestamp: '2025-02-26T09:00:00.000Z',
        linkUrl: '/dashboard/farmer',
      },
      {
        id: 'notif_02',
        userId: 'usr_landlord_01',
        role: 'LANDLORD',
        title: '📩 New Rental Request Received',
        message: 'Farmer Arun Kumar (6.2 KM away) requested to rent Green Valley Fertile Acres.',
        type: 'request',
        read: false,
        timestamp: '2025-02-25T10:16:00.000Z',
        linkUrl: '/dashboard/landlord',
      },
      {
        id: 'notif_03',
        userId: 'usr_admin_01',
        role: 'ADMIN',
        title: '🛡️ System Geolocation Engine Active',
        message: '20 KM Geospatial filtering is actively enforcing proximity checks across 8 listings.',
        type: 'success',
        read: false,
        timestamp: '2025-02-26T07:00:00.000Z',
        linkUrl: '/dashboard/admin',
      },
    ];

    // SEED ADMIN AUDIT LOGS
    this.auditLogs = [
      {
        id: 'log_01',
        adminId: 'usr_admin_01',
        adminName: 'Dr. Anand Ramanathan',
        action: 'LAND_VERIFICATION_APPROVED',
        targetType: 'LAND',
        targetId: 'land_01',
        details: 'Verified Patta and GPS boundary coordinates for Green Valley Fertile Acres.',
        timestamp: '2025-02-06T11:20:00.000Z',
      },
      {
        id: 'log_02',
        adminId: 'usr_admin_01',
        adminName: 'Dr. Anand Ramanathan',
        action: 'FARMER_ACCOUNT_ACTIVATION',
        targetType: 'USER',
        targetId: 'usr_farmer_01',
        details: 'Approved farmer registration with mobile OTP and address proof verification.',
        timestamp: '2025-02-01T10:35:00.000Z',
      },
      {
        id: 'log_03',
        adminId: 'usr_admin_01',
        adminName: 'Dr. Anand Ramanathan',
        action: 'SYSTEM_SETTINGS_UPDATE',
        targetType: 'SYSTEM',
        targetId: 'CONFIG_GEO_20KM',
        details: 'Confirmed strict 20 KM proximity radius policy for all farmer land searches.',
        timestamp: '2025-01-15T09:00:00.000Z',
      },
    ];
  }

  // --- USER OPERATIONS ---
  public findUserByEmail(email: string): UserRecord | undefined {
    const lowerEmail = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase().trim() === lowerEmail) {
        return user;
      }
    }
    return undefined;
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  public createUser(user: UserRecord): UserProfile {
    this.users.set(user.id, user);
    this.addAuditLog('usr_admin_01', 'System Admin', 'USER_REGISTRATION', 'USER', user.id, `New ${user.role} registered: ${user.name} (${user.email})`);
    
    // Notify admin
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'usr_admin_01',
      role: 'ADMIN',
      title: `👤 New ${user.role} Registered`,
      message: `${user.name} registered from ${user.village || user.location?.district || 'Tamil Nadu'}.`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
      linkUrl: '/dashboard/admin',
    });

    const { passwordHash, ...profile } = user;
    return profile;
  }

  public updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    const { passwordHash, ...profile } = updated;
    return profile;
  }

  public getAllUsers(role?: string): UserProfile[] {
    const list: UserProfile[] = [];
    for (const u of this.users.values()) {
      if (!role || u.role === role) {
        const { passwordHash, ...profile } = u;
        list.push(profile);
      }
    }
    return list;
  }

  // --- LAND OPERATIONS ---
  public getAllLands(): LandItem[] {
    return Array.from(this.lands.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getLandById(id: string): LandItem | undefined {
    return this.lands.get(id);
  }

  /**
   * CORE 20 KM GEOLOCATION FILTERING
   * Computes Haversine distance between farmer coordinates and all available lands.
   * STRICTLY returns ONLY lands with distance <= 20 km.
   */
  public getNearbyLandsForFarmer(
    farmerLat: number,
    farmerLon: number,
    filters?: {
      maxDistanceKm?: number;
      soilType?: string;
      waterAvailability?: string;
      electricityAvailability?: string;
      maxRent?: number;
      minArea?: number;
      status?: string;
      searchQuery?: string;
      sortBy?: 'nearest' | 'lowest_rent' | 'highest_area' | 'recently_added';
    }
  ): { lands: LandItem[]; farmerCoordinates: { latitude: number; longitude: number }; totalSearched: number } {
    const maxRadius = filters?.maxDistanceKm || MAX_RENTAL_DISTANCE_KM; // default 20 KM
    const allLands = Array.from(this.lands.values());
    const totalSearched = allLands.length;

    const nearbyLands: LandItem[] = [];

    for (const land of allLands) {
      // Calculate distance using Haversine formula
      const dist = calculateDistanceKm(
        farmerLat,
        farmerLon,
        land.location.latitude,
        land.location.longitude
      );

      const isWithinRadius = dist <= maxRadius;

      // Filter by radius first (MANDATORY REQUIREMENT)
      if (!isWithinRadius) {
        continue;
      }

      // Filter by status (default to AVAILABLE unless specified)
      if (filters?.status && land.status !== filters.status) {
        continue;
      }

      // Filter by Soil Type
      if (filters?.soilType && filters.soilType !== 'ALL' && land.soilType !== filters.soilType) {
        continue;
      }

      // Filter by Water
      if (filters?.waterAvailability && filters.waterAvailability !== 'ALL' && land.waterAvailability !== filters.waterAvailability) {
        continue;
      }

      // Filter by Max Rent
      if (filters?.maxRent && land.rentAmount > filters.maxRent) {
        continue;
      }

      // Filter by Min Area
      if (filters?.minArea && land.totalArea < filters.minArea) {
        continue;
      }

      // Filter by Search Query
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          land.name.toLowerCase().includes(q) ||
          land.soilType.toLowerCase().includes(q) ||
          (land.location.village && land.location.village.toLowerCase().includes(q)) ||
          (land.location.district && land.location.district.toLowerCase().includes(q)) ||
          land.landCode.toLowerCase().includes(q);
        if (!matches) continue;
      }

      nearbyLands.push({
        ...land,
        distanceKm: dist,
        isWithin20Km: true,
      });
    }

    // Sorting
    const sortBy = filters?.sortBy || 'nearest';
    nearbyLands.sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      if (sortBy === 'lowest_rent') {
        return a.rentAmount - b.rentAmount;
      }
      if (sortBy === 'highest_area') {
        return b.totalArea - a.totalArea;
      }
      if (sortBy === 'recently_added') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return {
      lands: nearbyLands,
      farmerCoordinates: { latitude: farmerLat, longitude: farmerLon },
      totalSearched,
    };
  }

  public getLandsByLandlord(landlordId: string): LandItem[] {
    return Array.from(this.lands.values())
      .filter((l) => l.landlordId === landlordId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createLand(land: LandItem): LandItem {
    this.lands.set(land.id, land);
    this.addAuditLog(land.landlordId, land.landlordName, 'LAND_CREATED', 'LAND', land.id, `Created agricultural land listing: ${land.name} (${land.totalArea} ${land.areaUnit})`);
    
    // Broadcast notification to farmers
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'usr_farmer_01',
      role: 'FARMER',
      title: '🌾 New Land Listed Nearby',
      message: `"${land.name}" (${land.totalArea} ${land.areaUnit}, ${land.soilType}) is now available for lease in ${land.location.district || 'your area'}.`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
      linkUrl: '/dashboard/farmer',
    });

    return land;
  }

  public updateLand(id: string, updates: Partial<LandItem>): LandItem | null {
    const land = this.lands.get(id);
    if (!land) return null;
    const updated = { ...land, ...updates, updatedAt: new Date().toISOString() };
    this.lands.set(id, updated);
    return updated;
  }

  public deleteLand(id: string, requesterId: string, requesterName: string): boolean {
    const exists = this.lands.has(id);
    if (!exists) return false;
    this.lands.delete(id);
    this.addAuditLog(requesterId, requesterName, 'LAND_DELETED', 'LAND', id, `Deleted agricultural land listing ${id}`);
    return true;
  }

  // --- RENTAL REQUESTS & LEASE WORKFLOW ---
  public createRentalRequest(req: RentalRequest): RentalRequest {
    this.rentalRequests.set(req.id, req);
    
    // Notify Landlord
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.landlordId,
      role: 'LANDLORD',
      title: '📩 New Rental Request',
      message: `${req.farmerName} (${req.distanceKm} KM away) has requested to rent "${req.landName}" for ${req.requestedDuration}.`,
      type: 'request',
      read: false,
      timestamp: new Date().toISOString(),
      linkUrl: '/dashboard/landlord',
    });

    // Notify Admin
    this.addAuditLog(req.farmerId, req.farmerName, 'RENTAL_REQUEST_SUBMITTED', 'RENTAL', req.id, `Farmer submitted rental request for land ${req.landName} (Distance: ${req.distanceKm} KM)`);

    return req;
  }

  public getRentalRequestsForFarmer(farmerId: string): RentalRequest[] {
    return Array.from(this.rentalRequests.values())
      .filter((r) => r.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRentalRequestsForLandlord(landlordId: string): RentalRequest[] {
    return Array.from(this.rentalRequests.values())
      .filter((r) => r.landlordId === landlordId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllRentalRequests(): RentalRequest[] {
    return Array.from(this.rentalRequests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getRentalRequestById(id: string): RentalRequest | undefined {
    return this.rentalRequests.get(id);
  }

  public approveRentalRequest(requestId: string, landlordNotes?: string): { request: RentalRequest; land: LandItem } | null {
    const req = this.rentalRequests.get(requestId);
    if (!req) return null;

    const land = this.lands.get(req.landId);
    if (!land) return null;

    // Update Request status
    req.status = 'APPROVED';
    req.landlordDecisionNotes = landlordNotes || 'Rental request approved by landlord.';
    req.updatedAt = new Date().toISOString();
    this.rentalRequests.set(requestId, req);

    // Update Land status: AVAILABLE -> RESERVED
    land.status = 'RESERVED';
    land.activeRentalFarmerId = req.farmerId;
    land.activeRentalFarmerName = req.farmerName;
    land.updatedAt = new Date().toISOString();
    this.lands.set(land.id, land);

    // Notify Farmer
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.farmerId,
      role: 'FARMER',
      title: '🎉 Rental Request Approved!',
      message: `Great news! Landlord ${req.landlordName} has approved your rental request for "${req.landName}". Land is now RESERVED for you!`,
      type: 'success',
      read: false,
      timestamp: new Date().toISOString(),
      linkUrl: '/dashboard/farmer',
    });

    this.addAuditLog(req.landlordId, req.landlordName, 'RENTAL_REQUEST_APPROVED', 'RENTAL', req.id, `Approved rental request for ${req.landName}, status transitioned to RESERVED`);

    return { request: req, land };
  }

  public rejectRentalRequest(requestId: string, reason?: string): RentalRequest | null {
    const req = this.rentalRequests.get(requestId);
    if (!req) return null;

    req.status = 'REJECTED';
    req.landlordDecisionNotes = reason || 'Declined by landlord.';
    req.updatedAt = new Date().toISOString();
    this.rentalRequests.set(requestId, req);

    // Notify Farmer
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.farmerId,
      role: 'FARMER',
      title: '❌ Rental Request Update',
      message: `Your rental request for "${req.landName}" was declined. Reason: ${req.landlordDecisionNotes}`,
      type: 'warning',
      read: false,
      timestamp: new Date().toISOString(),
      linkUrl: '/dashboard/farmer',
    });

    return req;
  }

  public startRentalLease(requestId: string): { request: RentalRequest; land: LandItem } | null {
    const req = this.rentalRequests.get(requestId);
    if (!req) return null;
    const land = this.lands.get(req.landId);
    if (!land) return null;

    // Transition Land from RESERVED to RENTED
    land.status = 'RENTED';
    land.updatedAt = new Date().toISOString();
    this.lands.set(land.id, land);

    // Notify Farmer & Landlord
    this.addNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.farmerId,
      role: 'FARMER',
      title: '🚜 Rental Period Commenced',
      message: `Your active rental on "${land.name}" has officially started! Happy farming!`,
      type: 'success',
      read: false,
      timestamp: new Date().toISOString(),
      linkUrl: '/dashboard/farmer',
    });

    this.addAuditLog(req.landlordId, req.landlordName, 'RENTAL_LEASE_STARTED', 'RENTAL', req.id, `Rental lease commenced for ${land.name} (Status: RENTED)`);

    return { request: req, land };
  }

  public completeRentalLease(requestId: string): { request: RentalRequest; land: LandItem } | null {
    const req = this.rentalRequests.get(requestId);
    if (!req) return null;
    const land = this.lands.get(req.landId);
    if (!land) return null;

    // Transition Land from RENTED back to AVAILABLE
    land.status = 'AVAILABLE';
    land.activeRentalFarmerId = undefined;
    land.activeRentalFarmerName = undefined;
    land.updatedAt = new Date().toISOString();
    this.lands.set(land.id, land);

    req.status = 'COMPLETED';
    req.updatedAt = new Date().toISOString();
    this.rentalRequests.set(requestId, req);

    this.addAuditLog('usr_admin_01', 'System', 'RENTAL_LEASE_COMPLETED', 'RENTAL', req.id, `Rental completed. ${land.name} returned to AVAILABLE status.`);

    return { request: req, land };
  }

  // --- NOTIFICATIONS ---
  public getNotificationsForUser(userId: string, role?: string): NotificationItem[] {
    return this.notifications
      .filter((n) => n.userId === userId || n.role === role || n.role === 'ALL')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
  }

  public addNotification(notification: NotificationItem): void {
    this.notifications.unshift(notification);
    if (this.notifications.length > 200) {
      this.notifications.pop();
    }
  }

  // --- AUDIT LOGS ---
  public addAuditLog(
    adminId: string,
    adminName: string,
    action: string,
    targetType: 'USER' | 'LAND' | 'RENTAL' | 'SYSTEM',
    targetId: string,
    details: string
  ): void {
    const log: AdminAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId,
      adminName,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(): AdminAuditLog[] {
    return this.auditLogs;
  }

  // --- ADMIN STATISTICS ---
  public getSystemStatistics(): DashboardStatistics {
    const farmers = Array.from(this.users.values()).filter((u) => u.role === 'FARMER');
    const landlords = Array.from(this.users.values()).filter((u) => u.role === 'LANDLORD');
    const lands = Array.from(this.lands.values());
    const requests = Array.from(this.rentalRequests.values());

    const availableLands = lands.filter((l) => l.status === 'AVAILABLE').length;
    const reservedLands = lands.filter((l) => l.status === 'RESERVED').length;
    const rentedLands = lands.filter((l) => l.status === 'RENTED').length;
    const maintenanceLands = lands.filter((l) => l.status === 'MAINTENANCE').length;
    const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;
    const activeRentals = rentedLands + reservedLands;

    const totalRentalValue = lands.reduce((acc, l) => acc + (l.status === 'RENTED' || l.status === 'RESERVED' ? l.rentAmount : 0), 0);
    const avgRentPerAcre = Math.round(
      lands.reduce((acc, l) => acc + (l.rentAmount / (l.totalArea || 1)), 0) / (lands.length || 1)
    );

    // Soil distribution
    const soilCounts: Record<string, number> = {};
    lands.forEach((l) => {
      soilCounts[l.soilType] = (soilCounts[l.soilType] || 0) + 1;
    });
    const soilDistribution = Object.entries(soilCounts).map(([name, value]) => ({ name, value }));

    return {
      totalFarmers: farmers.length,
      totalLandlords: landlords.length,
      totalLands: lands.length,
      availableLands,
      reservedLands,
      rentedLands,
      maintenanceLands,
      pendingRequests,
      activeRentals,
      totalRentalValue: totalRentalValue || 185000,
      avgRentPerAcre: avgRentPerAcre || 6800,
      growthTrends: [
        { month: 'Oct', farmers: 45, landlords: 18, rentals: 12, revenue: 140000 },
        { month: 'Nov', farmers: 78, landlords: 29, rentals: 25, revenue: 260000 },
        { month: 'Dec', farmers: 120, landlords: 45, rentals: 42, revenue: 450000 },
        { month: 'Jan', farmers: 195, landlords: 68, rentals: 70, revenue: 680000 },
        { month: 'Feb', farmers: 280, landlords: 92, rentals: 110, revenue: 990000 },
      ],
      soilDistribution: soilDistribution.length > 0 ? soilDistribution : [
        { name: 'Red Soil', value: 4 },
        { name: 'Black Soil', value: 2 },
        { name: 'Alluvial Soil', value: 3 },
        { name: 'Loam Soil', value: 2 },
      ],
      regionalDistribution: [
        { state: 'Tamil Nadu (Thiruvallur & Chennai)', lands: lands.length, farmers: farmers.length },
        { state: 'Karnataka (Bangalore Rural & Mandya)', lands: 14, farmers: 28 },
        { state: 'Maharashtra (Nashik & Pune)', lands: 22, farmers: 45 },
        { state: 'Andhra Pradesh (Chittoor & Nellore)', lands: 18, farmers: 34 },
      ],
    };
  }

  public resetToSeed(): void {
    this.users.clear();
    this.lands.clear();
    this.rentalRequests.clear();
    this.notifications = [];
    this.auditLogs = [];
    this.seedInitialData();
  }
}

export const db = new DataStore();
