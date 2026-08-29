import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { ResourceModel, IResource } from '../models/Resource';
import { sendSuccess, sendError } from '../utils/response';

export class ResourceController {
  static async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await FirebaseService.getCollection<IResource>(COLLECTIONS.AGRI_RESOURCES);
      return sendSuccess(res, resources, 'Agri-resources retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ResourceModel.format(req.body);
      const created = await FirebaseService.createDocument<IResource>(COLLECTIONS.AGRI_RESOURCES, data);
      return sendSuccess(res, created, 'Resource added', 201);
    } catch (error) {
      next(error);
    }
  }
}
