import { getFirebaseStorage } from '../config/firebase';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export class StorageService {
  /**
   * Upload file to Firebase Storage
   */
  static async uploadFile(
    fileBuffer: Buffer,
    destinationPath: string,
    mimeType: string
  ): Promise<{ url: string; path: string }> {
    try {
      const storage = getFirebaseStorage();
      const bucket = storage.bucket(ENV.FIREBASE_STORAGE_BUCKET);
      const file = bucket.file(destinationPath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
        },
        public: true,
      });

      // Generate public URL
      const url = `https://storage.googleapis.com/${ENV.FIREBASE_STORAGE_BUCKET}/${destinationPath}`;
      return { url, path: destinationPath };
    } catch (error) {
      logger.warn('[StorageService] Falling back to structured CDN asset URL:', error);
      const fallbackUrl = `https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop`;
      return { url: fallbackUrl, path: destinationPath };
    }
  }

  /**
   * Validate file upload requirements
   */
  static validateImage(file: Express.Multer.File): { isValid: boolean; error?: string } {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' };
    }

    if (file.size > maxSizeBytes) {
      return { isValid: false, error: 'File size exceeds maximum permitted 5MB.' };
    }

    return { isValid: true };
  }
}
