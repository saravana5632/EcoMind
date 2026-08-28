import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebaseService';
import { COLLECTIONS } from '../config/constants';
import { ProductModel, IProduct } from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await FirebaseService.getCollection<IProduct>(COLLECTIONS.AGRI_PRODUCTS);
      return sendSuccess(res, products, 'Market products retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMyProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const products = await FirebaseService.queryCollection<IProduct>(
        COLLECTIONS.AGRI_PRODUCTS,
        [{ field: 'farmerId', operator: '==', value: farmerId }]
      );
      return sendSuccess(res, products, 'Farmer products retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user?.id || req.user?.firebaseUid;
      if (!farmerId) return sendError(res, 'Unauthorized', 401);

      const data = ProductModel.format({
        ...req.body,
        farmerId,
        farmerName: req.user?.name || 'Farmer',
        farmerPhone: req.user?.phone || '',
      });

      const created = await FirebaseService.createDocument<IProduct>(COLLECTIONS.AGRI_PRODUCTS, data);
      return sendSuccess(res, created, 'Product listed for buyers', 201);
    } catch (error) {
      next(error);
    }
  }
}
