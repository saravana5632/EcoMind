import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS, ROLES, LAND_STATUS, RENTAL_STATUS } from '../config/constants';
import { UserModel } from '../models/User';
import { FarmerModel } from '../models/Farmer';
import { LandlordModel } from '../models/Landlord';
import { FarmProfileModel } from '../models/FarmProfile';
import { LandModel } from '../models/Land';
import { ResourceModel } from '../models/Resource';
import { ProductModel } from '../models/Product';
import { BuyerModel } from '../models/Buyer';
import { RentalRequestModel } from '../models/RentalRequest';
import { AIRecommendationModel } from '../models/AIRecommendation';
import { logger } from '../utils/logger';

export async function seedInitialAgriData(force: boolean = false) {
  try {
    const existingLands = await FirebaseService.getCollection(COLLECTIONS.AGRI_LANDS);
    if (!force && existingLands.length > 0) {
      logger.info(`[Seed] Firestore already contains ${existingLands.length} lands. Skipping automatic full seed.`);
      return;
    }

    logger.info('[Seed] Initializing EcoMind Agri Firestore seed data...');

    // 1. Seed Admin User
    const adminUser = UserModel.format({
      firebaseUid: 'admin_master_001',
      name: 'EcoMind Agri Admin',
      email: 'admin@ecomind.agri',
      phone: '+91 9999900000',
      role: ROLES.ADMIN,
      app: 'AGRI',
      status: 'ACTIVE',
      latitude: 13.0827,
      longitude: 80.2707,
    }, 'admin_master_001');
    await FirebaseService.createDocument(COLLECTIONS.USERS, adminUser, 'admin_master_001');

    // 2. Seed Farmers (Chennai / Chengalpattu / Kanchipuram cluster)
    const farmer1 = UserModel.format({
      firebaseUid: 'farmer_muthu_001',
      name: 'Muthuvel Karunan',
      email: 'muthu@ecomind.agri',
      phone: '+91 9840112233',
      role: ROLES.FARMER,
      app: 'AGRI',
      status: 'ACTIVE',
      address: '74 East Coast Road, Thiruvanmiyur',
      village: 'Kottivakkam',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600041',
      latitude: 12.9863,
      longitude: 80.2589,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    }, 'farmer_muthu_001');
    await FirebaseService.createDocument(COLLECTIONS.USERS, farmer1, 'farmer_muthu_001');
    await FirebaseService.createDocument(COLLECTIONS.AGRI_FARMERS, FarmerModel.format(farmer1, 'farmer_muthu_001'), 'farmer_muthu_001');

    const farmerProfile1 = FarmProfileModel.format({
      farmerId: 'farmer_muthu_001',
      farmName: 'Muthu Organic Homestead',
      location: 'Kottivakkam, Chennai',
      latitude: 12.9863,
      longitude: 80.2589,
      farmSize: 3.5,
      soilType: 'Red Loam Soil',
      waterAvailability: 'Borewell & Canal (24/7)',
      budget: 65000,
      currentCrop: 'Fallow / Ready for Sowing',
      preferredCrop: 'Tomato',
      season: 'Kharif',
    }, 'farmer_muthu_001');
    await FirebaseService.createDocument(COLLECTIONS.AGRI_FARM_PROFILES, farmerProfile1, 'farmer_muthu_001');

    // 3. Seed Landlords
    const landlord1 = UserModel.format({
      firebaseUid: 'landlord_rajesh_001',
      name: 'Rajesh Kumar Sundaram',
      email: 'rajesh@ecomind.agri',
      phone: '+91 9841234567',
      role: ROLES.LANDLORD,
      app: 'AGRI',
      status: 'ACTIVE',
      address: 'Plot 12, GST Main Road',
      village: 'Vandalur',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      pincode: '600048',
      latitude: 12.8912,
      longitude: 80.0815,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    }, 'landlord_rajesh_001');
    await FirebaseService.createDocument(COLLECTIONS.USERS, landlord1, 'landlord_rajesh_001');
    await FirebaseService.createDocument(COLLECTIONS.AGRI_LANDLORDS, LandlordModel.format({
      ...landlord1,
      totalLandsCount: 3,
    }, 'landlord_rajesh_001'), 'landlord_rajesh_001');

    const landlord2 = UserModel.format({
      firebaseUid: 'landlord_anand_002',
      name: 'Anand Natarajan',
      email: 'anand@ecomind.agri',
      phone: '+91 9841998877',
      role: ROLES.LANDLORD,
      app: 'AGRI',
      status: 'ACTIVE',
      village: 'Maraimalai Nagar',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      latitude: 12.7938,
      longitude: 80.0242,
    }, 'landlord_anand_002');
    await FirebaseService.createDocument(COLLECTIONS.USERS, landlord2, 'landlord_anand_002');
    await FirebaseService.createDocument(COLLECTIONS.AGRI_LANDLORDS, LandlordModel.format({
      ...landlord2,
      totalLandsCount: 2,
    }, 'landlord_anand_002'), 'landlord_anand_002');

    // 4. Seed Agricultural Lands (with varying distances: 4km, 8km, 14km, 18km, and 45km outside radius)
    const lands = [
      {
        id: 'land_vandalur_001',
        landCode: 'LND-VND-01',
        landlordId: 'landlord_rajesh_001',
        landlordName: 'Rajesh Kumar Sundaram',
        landlordPhone: '+91 9841234567',
        landName: 'Vandalur Fertile Riverbank Plot',
        name: 'Vandalur Fertile Riverbank Plot',
        description: 'Prime agricultural acreage with certified red loam soil, deep borewell connected to solar micro-drip, and perimeter bio-fencing.',
        area: 4.5,
        totalArea: 4.5,
        areaUnit: 'Acres',
        soilType: 'Red Loam',
        waterAvailability: 'Borewell & Canal (24/7)',
        waterSource: 'Solar Borewell + Canal',
        electricityAvailable: true,
        electricityAvailability: '3-Phase 24/7 Dedicated',
        suitableCrops: ['Tomato', 'Chilli', 'Brinjal', 'Groundnut', 'Spinach'],
        rentAmount: 32000,
        rentPeriod: 'Year',
        securityDeposit: 15000,
        address: 'Near Vandalur Lake, GST Outer Road',
        village: 'Vandalur',
        district: 'Chengalpattu',
        state: 'Tamil Nadu',
        pincode: '600048',
        latitude: 12.8912,
        longitude: 80.0815, // ~19 km from Kottivakkam
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800',
        ],
        status: LAND_STATUS.AVAILABLE,
        verified: true,
      },
      {
        id: 'land_sholinganallur_002',
        landCode: 'LND-SHL-02',
        landlordId: 'landlord_rajesh_001',
        landlordName: 'Rajesh Kumar Sundaram',
        landlordPhone: '+91 9841234567',
        landName: 'Sholinganallur Green Belt Acreage',
        name: 'Sholinganallur Green Belt Acreage',
        description: 'Rich organic loam soil parcel situated right along the agricultural canal belt. Ideal for organic vegetable production.',
        area: 3.0,
        totalArea: 3.0,
        areaUnit: 'Acres',
        soilType: 'Alluvial Loam',
        waterAvailability: 'High Water Table & Canal',
        waterSource: 'Canal & Open Well',
        electricityAvailable: true,
        electricityAvailability: '3-Phase 10hrs/day',
        suitableCrops: ['Paddy', 'Spinach', 'Coriander', 'Tomato', 'Ladyfinger'],
        rentAmount: 28000,
        rentPeriod: 'Year',
        securityDeposit: 10000,
        address: 'OMR Link Road, Sholinganallur',
        village: 'Sholinganallur',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600119',
        latitude: 12.9010,
        longitude: 80.2279, // ~9 km from Kottivakkam
        images: [
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        ],
        status: LAND_STATUS.AVAILABLE,
        verified: true,
      },
      {
        id: 'land_medavakkam_003',
        landCode: 'LND-MDV-03',
        landlordId: 'landlord_anand_002',
        landlordName: 'Anand Natarajan',
        landlordPhone: '+91 9841998877',
        landName: 'Medavakkam Agro-Zone Field',
        name: 'Medavakkam Agro-Zone Field',
        description: 'Level farm land with automated drip layout and high-yield soil nutrient profile.',
        area: 5.0,
        totalArea: 5.0,
        areaUnit: 'Acres',
        soilType: 'Black Clay Soil',
        waterAvailability: 'Borewell (24/7)',
        waterSource: 'Dual Borewells',
        electricityAvailable: true,
        electricityAvailability: '3-Phase Continuous',
        suitableCrops: ['Cotton', 'Maize', 'Chilli', 'Groundnut', 'Tomato'],
        rentAmount: 38000,
        rentPeriod: 'Year',
        securityDeposit: 18000,
        address: 'Nanmangalam Forest Road',
        village: 'Medavakkam',
        district: 'Chengalpattu',
        state: 'Tamil Nadu',
        pincode: '600100',
        latitude: 12.9185,
        longitude: 80.1912, // ~10 km from Kottivakkam
        images: [
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800',
        ],
        status: LAND_STATUS.AVAILABLE,
        verified: true,
      },
      {
        id: 'land_kanchipuram_004',
        landCode: 'LND-KNC-04',
        landlordId: 'landlord_anand_002',
        landlordName: 'Anand Natarajan',
        landlordPhone: '+91 9841998877',
        landName: 'Kanchipuram Distant Heritage Estate (Out of Radius Demo)',
        name: 'Kanchipuram Distant Heritage Estate',
        description: 'Expansive paddy fields in central Kanchipuram district (> 55 KM from Chennai urban zone for distance testing).',
        area: 12.0,
        totalArea: 12.0,
        areaUnit: 'Acres',
        soilType: 'Alluvial Loam',
        waterAvailability: 'Lake Irrigation Canal',
        waterSource: 'Lake Canal',
        electricityAvailable: true,
        electricityAvailability: '3-Phase 8hrs/day',
        suitableCrops: ['Paddy', 'Sugarcane', 'Turmeric'],
        rentAmount: 60000,
        rentPeriod: 'Year',
        securityDeposit: 25000,
        address: 'Palur Road, Kanchipuram Outer',
        village: 'Walajabad',
        district: 'Kanchipuram',
        state: 'Tamil Nadu',
        pincode: '631605',
        latitude: 12.8023,
        longitude: 79.8142, // ~52 km from Kottivakkam (Demonstrating the 20KM backend rejection rule)
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        ],
        status: LAND_STATUS.AVAILABLE,
        verified: true,
      },
    ];

    for (const l of lands) {
      const formatted = LandModel.format(l, l.id);
      await FirebaseService.createDocument(COLLECTIONS.AGRI_LANDS, formatted, l.id);
    }

    // 5. Seed Resources
    const resources = [
      { id: 'res_seed_01', name: 'Certified F1 Hybrid Tomato Seeds (Arka Rakshak)', category: 'SEEDS', quantity: 150, unit: 'Packets (50g)', pricePerUnit: 480, supplier: 'TNAU Seed Center', location: 'Chennai Hub' },
      { id: 'res_fert_02', name: 'Organic Vermicompost (Nutrient-Enriched)', category: 'FERTILIZERS', quantity: 500, unit: 'Bags (50kg)', pricePerUnit: 350, supplier: 'EcoBio Inputs', location: 'Chengalpattu Depot' },
      { id: 'res_eq_03', name: 'Drip Lateral Irrigation Kit (1 Acre Complete)', category: 'EQUIPMENT', quantity: 20, unit: 'Sets', pricePerUnit: 12500, supplier: 'Jain Agro Irrigation', location: 'Tambaram Distribution' },
      { id: 'res_bio_04', name: 'Trichoderma Viride & Pseudomonas Bio-Packs', category: 'PESTICIDES', quantity: 200, unit: 'Bottles (1L)', pricePerUnit: 220, supplier: 'GreenBiotech Labs', location: 'Chennai Hub' },
    ];
    for (const r of resources) {
      await FirebaseService.createDocument(COLLECTIONS.AGRI_RESOURCES, ResourceModel.format(r, r.id), r.id);
    }

    // 6. Seed Buyers
    const buyers = [
      { id: 'byr_01', name: 'Koyambedu Wholesale Traders Union', businessName: 'Koyambedu Agro Mandi', location: 'Koyambedu, Chennai', latitude: 13.0694, longitude: 80.1948, buyerType: 'WHOLESALER', preferredCrops: ['Tomato', 'Chilli', 'Brinjal', 'Paddy'] },
      { id: 'byr_02', name: 'PureHarvest Organics Retail', businessName: 'PureHarvest Stores', location: 'Adyar, Chennai', latitude: 13.0012, longitude: 80.2565, buyerType: 'RETAILER', preferredCrops: ['Organic Tomato', 'Spinach', 'Groundnut'] },
      { id: 'byr_03', name: 'Southern Food Processing Ltd', businessName: 'Southern Agro Foods', location: 'Maraimalai Nagar SIPCOT', latitude: 12.7938, longitude: 80.0242, buyerType: 'PROCESSOR', preferredCrops: ['Tomato Puree Grade', 'Chilli', 'Maize'] },
    ];
    for (const b of buyers) {
      await FirebaseService.createDocument(COLLECTIONS.AGRI_BUYERS, BuyerModel.format(b, b.id), b.id);
    }

    // 7. Seed Initial AI Recommendation
    const sampleRec = AIRecommendationModel.format({
      farmerId: 'farmer_muthu_001',
      crop: 'Tomato (Arka Rakshak)',
      plantingRecommendation: 'Optimal sowing window is within next 5-8 days utilizing raised nursery beds with 50% shade netting.',
      harvestRecommendation: 'Expected first flush harvest in 75 days, continued fruiting over 45 days.',
      waterRequirement: 'Moderate (6.5 liters/plant/week via micro-drip)',
      expectedResources: ['Certified F1 Tomato Seeds', 'Vermicompost (5 tons)', 'Drip Lateral Setup', 'Neem Cake'],
      expectedCost: 42000,
      expectedYield: 8500,
      expectedProfit: 125000,
      risk: 'Low',
      sustainabilityScore: 92,
      weatherSummary: 'Warm monsoon intervals with 28°C mean temperature.',
      soilSuitability: 'Red Loam pH 6.5 with optimal nitrogen mineralization.',
      marketOutlook: 'Wholesale mandi price currently at ₹38/kg with rising trend.',
    });
    await FirebaseService.createDocument(COLLECTIONS.AGRI_AI_RECOMMENDATIONS, sampleRec);

    logger.info('[Seed] EcoMind Agri Firestore seeding complete with rich agricultural domain data!');
  } catch (error) {
    logger.error('[Seed] Error during seeding:', error);
  }
}
