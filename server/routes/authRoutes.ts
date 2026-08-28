import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/dataStore';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../../src/types';

export const authRouter = Router();

// POST /api/auth/register/farmer
authRouter.post('/register/farmer', (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      dob,
      address,
      village,
      district,
      state,
      pincode,
      photoUrl,
      location,
      bio,
    } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({
        success: false,
        message: 'Full Name, Email, Phone, and Password are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please login.',
      });
      return;
    }

    // Coordinates fallback if not provided: Default near Chennai / Thiruvallur agri region
    const farmerLoc = {
      latitude: location?.latitude || 13.0827,
      longitude: location?.longitude || 80.2707,
      address: location?.address || address || `${village || 'Rural'}, ${district || 'Thiruvallur'}`,
      village: village || 'Puzhal',
      district: district || 'Thiruvallur',
      state: state || 'Tamil Nadu',
      pincode: pincode || '600066',
    };

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      id: `usr_farmer_${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      phone,
      role: 'FARMER' as UserRole,
      status: 'ACTIVE',
      dob,
      address,
      village,
      district,
      state,
      pincode,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      location: farmerLoc,
      bio: bio || 'Active agricultural cultivator seeking productive farmland within 20 KM.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      message: 'Farmer account created successfully! Welcome to LandLink.',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during farmer registration.',
    });
  }
});

// POST /api/auth/register/landlord
authRouter.post('/register/landlord', (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      village,
      district,
      state,
      pincode,
      photoUrl,
      location,
      bio,
    } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({
        success: false,
        message: 'Full Name, Email, Phone, and Password are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please login.',
      });
      return;
    }

    const landlordLoc = {
      latitude: location?.latitude || 13.1147,
      longitude: location?.longitude || 80.0983,
      address: location?.address || address || `${village || 'Rural Estate'}, ${district || 'Thiruvallur'}`,
      village: village || 'Avadi',
      district: district || 'Thiruvallur',
      state: state || 'Tamil Nadu',
      pincode: pincode || '600054',
    };

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      id: `usr_landlord_${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      phone,
      role: 'LANDLORD' as UserRole,
      status: 'ACTIVE',
      address,
      village,
      district,
      state,
      pincode,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      location: landlordLoc,
      bio: bio || 'Agricultural landowner leasing fertile parcels to dedicated farmers.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      message: 'Landlord account registered successfully! You can now list agricultural lands.',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during landlord registration.',
    });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found with this email.',
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated by administration. Please contact support.',
      });
      return;
    }

    // Optional role verification check
    if (role && user.role !== role) {
      res.status(403).json({
        success: false,
        message: `Account role mismatch. This login is configured for ${role}, but your account is registered as ${user.role}.`,
      });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
      });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { passwordHash, ...profile } = user;

    res.json({
      success: true,
      message: `Login successful. Welcome back, ${user.name}!`,
      data: {
        token,
        user: profile,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.',
    });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const user = db.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const { passwordHash, ...profile } = user;
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: profile,
  });
});

// PUT /api/auth/update-profile
authRouter.put('/update-profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const updates = req.body;
  // Prevent changing sensitive fields directly
  delete updates.id;
  delete updates.role;
  delete updates.passwordHash;

  const updated = db.updateUser(req.user.id, updates);
  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
});

// PUT /api/auth/update-location
authRouter.put('/update-location', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { latitude, longitude, address, village, district, state, pincode } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({
      success: false,
      message: 'Valid latitude and longitude numbers are required.',
    });
    return;
  }

  const updated = db.updateUser(req.user.id, {
    location: {
      latitude,
      longitude,
      address,
      village,
      district,
      state,
      pincode,
    },
  });

  res.json({
    success: true,
    message: 'Location updated successfully. Proximity search radius updated.',
    data: updated,
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});
