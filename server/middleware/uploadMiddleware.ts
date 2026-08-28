import multer from 'multer';

// Use memory storage so buffers can be uploaded to Firebase Storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size
  },
});
