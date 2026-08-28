import { Router, Response } from 'express';
import { db } from '../db/dataStore';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const adminRouter = Router();

// Protect all admin endpoints with RBAC (Role: ADMIN)
adminRouter.use(authenticateToken, requireRole('ADMIN'));

// GET /api/admin/statistics
adminRouter.get('/statistics', (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getSystemStatistics();
    res.json({
      success: true,
      message: 'System statistics retrieved successfully',
      data: stats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/farmers
adminRouter.get('/farmers', (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmers = db.getAllUsers('FARMER');
    res.json({
      success: true,
      message: 'Farmers retrieved successfully',
      data: farmers,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/landlords
adminRouter.get('/landlords', (req: AuthenticatedRequest, res: Response) => {
  try {
    const landlords = db.getAllUsers('LANDLORD');
    res.json({
      success: true,
      message: 'Landlords retrieved successfully',
      data: landlords,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/lands
adminRouter.get('/lands', (req: AuthenticatedRequest, res: Response) => {
  try {
    const lands = db.getAllLands();
    res.json({
      success: true,
      message: 'All registered lands retrieved successfully',
      data: lands,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/rentals
adminRouter.get('/rentals', (req: AuthenticatedRequest, res: Response) => {
  try {
    const rentals = db.getAllRentalRequests();
    res.json({
      success: true,
      message: 'All system rentals retrieved successfully',
      data: rentals,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.getAuditLogs();
    res.json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: logs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/status - Activate or Deactivate user account
adminRouter.put('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      res.status(400).json({ success: false, message: 'Status must be ACTIVE or INACTIVE' });
      return;
    }

    const updated = db.updateUser(req.params.id, { status });
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    db.addAuditLog(
      req.user!.id,
      req.user!.name,
      'USER_STATUS_CHANGE',
      'USER',
      req.params.id,
      `Changed status of user ${updated.name} to ${status}`
    );

    res.json({
      success: true,
      message: `User account status updated to ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/lands/:id/verify - Verify or unverify agricultural land
adminRouter.put('/lands/:id/verify', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { verified } = req.body;
    const land = db.getLandById(req.params.id);
    if (!land) {
      res.status(404).json({ success: false, message: 'Land not found' });
      return;
    }

    const updated = db.updateLand(req.params.id, { verified: Boolean(verified) });
    db.addAuditLog(
      req.user!.id,
      req.user!.name,
      verified ? 'LAND_VERIFIED' : 'LAND_UNVERIFIED',
      'LAND',
      req.params.id,
      `Land ${land.name} (${land.landCode}) verification status set to ${verified}`
    );

    res.json({
      success: true,
      message: `Land verification status set to ${verified}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/seed/reset - Reset demo database to pristine state
adminRouter.post('/seed/reset', (req: AuthenticatedRequest, res: Response) => {
  try {
    db.resetToSeed();
    res.json({
      success: true,
      message: 'Database reset to initial demo state with fresh listings, users, and requests.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
