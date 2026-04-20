import express from 'express';
import {
  createQRCode,
  getUserQRCodes,
  updateQRCode,
  deleteQRCode,
  createQRWithFile,
  getPublicQR,
  duplicateQRCode,
  toggleFavorite,
  batchDelete,
  getRecentScans,
  claimQRCodes,
  bulkCreateQRCodes,
  archiveQRCode,
  uploadImage,
} from '../controllers/qrcode.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { createQRLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import { validate, createQRSchema, updateQRSchema, batchDeleteSchema } from '../middleware/validator.middleware.js';

const router = express.Router();

router.post('/create', optionalAuth, createQRLimiter, validate(createQRSchema), createQRCode);
router.post('/create-with-file', optionalAuth, createQRLimiter, uploadLimiter, upload.single('file'), createQRWithFile);
router.get('/my-qrs', protect, getUserQRCodes);
router.get('/recent-scans', protect, getRecentScans);

router.get('/public/:shortId', getPublicQR);
router.post('/claim', optionalAuth, claimQRCodes);

router.post('/:id/duplicate', protect, duplicateQRCode);
router.patch('/:id/favorite', protect, toggleFavorite);
router.patch('/:id/archive', protect, archiveQRCode);
router.post('/batch-delete', protect, validate(batchDeleteSchema), batchDelete);
router.post('/bulk-create', protect, createQRLimiter, bulkCreateQRCodes);
router.post('/upload-image', optionalAuth, uploadLimiter, upload.single('file'), uploadImage);

router.put('/:id', protect, validate(updateQRSchema), updateQRCode);
router.delete('/:id', protect, deleteQRCode);

export default router;
