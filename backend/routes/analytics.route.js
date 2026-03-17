import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getOverview,
  getTimeseries,
  getDeviceBreakdown,
  getGeoBreakdown,
  getTopCampaigns,
  getQRAnalytics,
  getHeatmapData,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/timeseries', protect, getTimeseries);
router.get('/devices', protect, getDeviceBreakdown);
router.get('/geo', protect, getGeoBreakdown);
router.get('/top-campaigns', protect, getTopCampaigns);
router.get('/heatmap', protect, getHeatmapData);
router.get('/qr/:id', protect, getQRAnalytics);

export default router;
