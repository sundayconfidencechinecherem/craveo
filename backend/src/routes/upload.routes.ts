// backend/src/routes/upload.routes.ts - UPDATED VERSION
import express, { Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for memory storage with increased limits
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file (increased from 5MB)
    files: 10, // Increased from 4
    fieldSize: 50 * 1024 * 1024 // 50MB total field size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)!'));
    }
  },
});

// Error handling for multer
const handleMulterError = (err: any, res: Response) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large. Maximum size is 10MB per file.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ 
        error: 'Too many files. Maximum is 10 files.' 
      });
    }
    if (err.code === 'LIMIT_FIELD_KEY') {
      return res.status(413).json({ 
        error: 'Too many fields.' 
      });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Single image upload endpoint
router.post('/single', authenticate, (req: AuthRequest, res: Response) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return handleMulterError(err, res);
    }

    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No image provided' 
        });
      }

      console.log('Uploading single image:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const imageUrl = await uploadToCloudinary(req.file.buffer);

      res.json({
        success: true,
        url: imageUrl,
        message: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to upload image' 
      });
    }
  });
});

// Multiple images upload endpoint
router.post('/multiple', authenticate, (req: AuthRequest, res: Response) => {
  upload.array('images', 10)(req, res, async (err) => {
    if (err) {
      return handleMulterError(err, res);
    }

    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'No images provided' 
        });
      }

      const files = req.files as Express.Multer.File[];
      
      console.log(`Uploading ${files.length} images...`);
      files.forEach((file, index) => {
        console.log(`Image ${index + 1}:`, {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        });
      });

      const urls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));

      res.json({
        success: true,
        urls,
        message: `${files.length} images uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to upload images' 
      });
    }
  });
});

// Test endpoint to check if upload API is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload API is working',
    endpoints: [
      'POST /api/upload/single - Upload single image',
      'POST /api/upload/multiple - Upload multiple images'
    ],
    limits: {
      fileSize: '10MB per file',
      maxFiles: '10 files',
      allowedTypes: ['JPEG', 'PNG', 'GIF', 'WebP']
    }
  });
});

export default router;