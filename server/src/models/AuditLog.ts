import { COLLECTIONS } from '../config/constants';

export interface IAuditLog {
  id?: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  description: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
  createdAt?: string;
}

export const AuditLogModel = {
  collection: COLLECTIONS.AGRI_AUDIT_LOGS,
  format: (data: any, id?: string): IAuditLog => ({
    id: id || data.id,
    adminId: data.adminId || 'SYSTEM',
    adminEmail: data.adminEmail || 'admin@ecomind.agri',
    action: data.action || 'ADMIN_ACTION',
    targetType: data.targetType || 'SYSTEM',
    targetId: data.targetId || '',
    targetName: data.targetName || '',
    description: data.description || '',
    details: data.details || null,
    ipAddress: data.ipAddress || '',
    timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
    createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
  }),
};
