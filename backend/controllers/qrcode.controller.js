import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "../models/qrcode.model.js";
import ScanEvent from "../models/scanEvent.model.js";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import logger from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Helper: delete uploaded file if the QR's targetUrl points to a local upload
function cleanupUploadedFile(targetUrl) {
  if (!targetUrl) return;
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  if (targetUrl.startsWith(`${baseUrl}/uploads/`)) {
    const filename = targetUrl.replace(`${baseUrl}/uploads/`, '');
    const filePath = path.join(uploadsDir, filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        logger.error('File cleanup failed', { filePath, error: err.message });
      } else if (!err) {
        logger.debug('Uploaded file cleaned up', { filePath });
      }
    });
  }
}


export const createQRCode = async (req, res) => {
  try {
    const { title, qrType, targetUrl, content } = req.body;
    const userId = req.userId || null;

    const { description, expiresAt, maxScans, customSlug } = req.body;

    // Support custom slugs — validate format and uniqueness
    let shortId;
    if (customSlug) {
      if (!/^[a-zA-Z0-9_-]{3,50}$/.test(customSlug)) {
        return res.status(400).json({ success: false, message: "Custom slug must be 3-50 characters (letters, numbers, hyphens, underscores)." });
      }
      const existing = await QRCode.findOne({ where: { shortId: customSlug } });
      if (existing) {
        return res.status(409).json({ success: false, message: "This custom slug is already taken." });
      }
      shortId = customSlug;
    } else {
      shortId = crypto.randomBytes(4).toString("hex");
    }

    const newQR = await QRCode.create({
      userId,
      sessionToken: req.sessionToken || null,
      title: title || "Untitled QR",
      qrType,
      shortId,
      targetUrl,
      content: content ? JSON.stringify(content) : null,
      description: description || null,
      expiresAt: expiresAt || null,
      maxScans: maxScans || null,
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const qrLink = `${baseUrl}/q/${shortId}`;

    logger.info('QR code created', { userId, qrId: newQR.id, qrType, shortId });

    res.status(201).json({ success: true, data: newQR, qrLink });
  } catch (error) {
    logger.error("QR code creation failed", { userId: req.userId || null, error: error.message });
    res.status(500).json({ success: false, message: "Failed to generate QR code." });
  }
};

export const claimQRCodes = async (req, res) => {
  try {
    const { sessionToken } = req.body;
    const userId = req.userId; // From JWT auth middleware
 
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Must be authenticated to claim QR codes.',
      });
    }
 
    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Session token is required.',
      });
    }
 
    // Transfer all QR codes with this session token to the user
    const [claimedCount] = await QRCode.update(
      { userId, sessionToken: null },
      { where: { sessionToken, userId: null } }
    );
 
    // Also transfer any uploaded files (if you track uploads separately)
    // Uncomment if you have a separate uploads table:
    // await Upload.update(
    //   { userId, sessionToken: null },
    //   { where: { sessionToken, userId: null } }
    // );
 
    return res.status(200).json({
      success: true,
      claimed: claimedCount,
      message: claimedCount > 0
        ? `${claimedCount} QR code(s) added to your account.`
        : 'No unclaimed QR codes found for this session.',
    });
  } catch (error) {
    console.error('Claim QR Codes Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to claim QR codes.',
    });
  }
};

export const redirectQR = async (req, res) => {
  try {
    const { shortId } = req.params;

    const qrCode = await QRCode.findOne({ where: { shortId, isActive: true } });

    if (!qrCode) {
      return res.status(404).send("<h2>QR Code not found or inactive.</h2>");
    }

    // Check expiry
    if (qrCode.expiresAt && new Date() > new Date(qrCode.expiresAt)) {
      logger.info('Expired QR scan blocked', { shortId });
      return res.status(410).send("<h2>This QR code has expired.</h2>");
    }

    // Check scan limit
    if (qrCode.maxScans && qrCode.scanCount >= qrCode.maxScans) {
      logger.info('Scan limit reached', { shortId, maxScans: qrCode.maxScans });
      return res.status(410).send("<h2>This QR code has reached its scan limit.</h2>");
    }

    await qrCode.increment("scanCount");

    // Capture detailed scan metadata
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress;
    const ip = rawIp === '::1' || rawIp === '127.0.0.1' ? null : rawIp;
    const geo = ip ? geoip.lookup(ip) : null;
    const ua = new UAParser(req.headers['user-agent']);
    const device = ua.getDevice();

    const scanData = {
      qrCodeId: qrCode.id,
      country: geo?.country || null,
      region: geo?.region || null,
      city: geo?.city || null,
      latitude: geo?.ll?.[0] || null,
      longitude: geo?.ll?.[1] || null,
      browser: ua.getBrowser().name || null,
      os: ua.getOS().name || null,
      deviceType: device.type || 'desktop',
      referrer: req.headers['referer'] || null,
      ip,
      scannedAt: new Date(),
    };

    ScanEvent.create(scanData).catch(err => logger.error('Failed to log scan event', { shortId, error: err.message }));

    // Emit real-time scan notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${qrCode.userId}`).emit('scan', {
        qrTitle: qrCode.title,
        qrType: qrCode.qrType,
        shortId,
        country: scanData.country,
        city: scanData.city,
        browser: scanData.browser,
        os: scanData.os,
        deviceType: scanData.deviceType,
        scannedAt: scanData.scannedAt,
      });
    }

    logger.debug('QR scan', { shortId, ip: ip || 'localhost', os: ua.getOS().name, country: geo?.country });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (qrCode.qrType === "vCard Plus") return res.redirect(`${frontendUrl}/vcard/${shortId}`);
    if (qrCode.qrType === "List of links") return res.redirect(`${frontendUrl}/links/${shortId}`);
    if (qrCode.qrType === 'Social Media' || qrCode.qrType === 'Social') return res.redirect(`${frontendUrl}/social/${shortId}`);
    if (qrCode.qrType === 'Business') return res.redirect(`${frontendUrl}/business/${shortId}`);
    if (qrCode.qrType === 'Coupon') return res.redirect(`${frontendUrl}/coupon/${shortId}`);
    if (qrCode.qrType === 'App Store' || qrCode.qrType === 'App') return res.redirect(`${frontendUrl}/app/${shortId}`);
    if (qrCode.qrType === 'Landing page' || qrCode.qrType === 'Landing Page') return res.redirect(`${frontendUrl}/landing/${shortId}`);

    res.redirect(qrCode.targetUrl);
  } catch (error) {
    logger.error("QR redirect failed", { shortId: req.params?.shortId, error: error.message });
    res.status(500).send("<h2>Server Error</h2>");
  }
};

export const getUserQRCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const includeArchived = req.query.archived === 'true';

    const where = { userId };
    if (!includeArchived) {
      where.isArchived = false;
    }

    const { count, rows } = await QRCode.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error("Fetch QR codes failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to fetch QR codes." });
  }
};

export const updateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetUrl, isActive, description, expiresAt, maxScans, content, folderId } = req.body;
    const userId = req.user.id;

    const qrCode = await QRCode.findOne({ where: { id, userId } });

    if (!qrCode) {
      return res.status(404).json({ success: false, message: "QR Code not found or unauthorized." });
    }

    if (title !== undefined) qrCode.title = title;
    if (targetUrl !== undefined) qrCode.targetUrl = targetUrl;
    if (isActive !== undefined) qrCode.isActive = isActive;
    if (description !== undefined) qrCode.description = description;
    if (expiresAt !== undefined) qrCode.expiresAt = expiresAt || null;
    if (maxScans !== undefined) qrCode.maxScans = maxScans || null;
    if (content !== undefined) qrCode.content = content ? JSON.stringify(content) : null;
    if (folderId !== undefined) qrCode.folderId = folderId;

    await qrCode.save();
    logger.info('QR code updated', { userId, qrId: id });

    res.status(200).json({ success: true, message: "QR Code updated successfully", data: qrCode });
  } catch (error) {
    logger.error("QR code update failed", { userId: req.user?.id, qrId: req.params?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to update QR code." });
  }
};

export const deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const qrCode = await QRCode.findOne({ where: { id, userId } });

    if (!qrCode) {
      return res.status(404).json({ success: false, message: "QR Code not found or unauthorized." });
    }

    cleanupUploadedFile(qrCode.targetUrl);
    await qrCode.destroy();
    logger.info('QR code deleted', { userId, qrId: id });

    res.status(200).json({ success: true, message: "QR Code deleted successfully" });
  } catch (error) {
    logger.error("QR code deletion failed", { userId: req.user?.id, qrId: req.params?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to delete QR code." });
  }
};

export const createQRWithFile = async (req, res) => {
  try {
    const { title, qrType } = req.body;
    const userId = req.userId || null;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded or file upload failed." });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const targetUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const shortId = crypto.randomBytes(4).toString("hex");

    const newQR = await QRCode.create({
      userId,
      sessionToken: req.sessionToken || null,
      title: title || "Untitled Document QR",
      qrType,
      shortId,
      targetUrl,
    });

    const qrLink = `${baseUrl}/q/${shortId}`;

    logger.info('QR code with file created', { userId, qrId: newQR.id, qrType, shortId });

    res.status(201).json({ success: true, data: newQR, qrLink });
  } catch (error) {
    logger.error("QR code with file creation failed", { userId: req.userId || null, error: error.message });
    res.status(500).json({ success: false, message: "Failed to generate file QR code." });
  }
};

export const duplicateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const original = await QRCode.findOne({ where: { id, userId } });
    if (!original) {
      return res.status(404).json({ success: false, message: "QR Code not found." });
    }

    const shortId = crypto.randomBytes(4).toString("hex");
    const duplicate = await QRCode.create({
      userId,
      title: `${original.title} (Copy)`,
      qrType: original.qrType,
      shortId,
      targetUrl: original.targetUrl,
      content: original.content,
      description: original.description,
      expiresAt: null,
      maxScans: original.maxScans,
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    logger.info('QR code duplicated', { userId, originalId: id, newId: duplicate.id });

    res.status(201).json({ success: true, data: duplicate, qrLink: `${baseUrl}/q/${shortId}` });
  } catch (error) {
    logger.error("QR code duplication failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to duplicate QR code." });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const qrCode = await QRCode.findOne({ where: { id, userId } });
    if (!qrCode) {
      return res.status(404).json({ success: false, message: "QR Code not found." });
    }

    qrCode.isFavorite = !qrCode.isFavorite;
    await qrCode.save();

    res.json({ success: true, data: { isFavorite: qrCode.isFavorite } });
  } catch (error) {
    logger.error("Toggle favorite failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to update favorite." });
  }
};

export const batchDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No QR code IDs provided." });
    }

    // Cleanup uploaded files before deleting records
    const qrsToDelete = await QRCode.findAll({ where: { id: ids, userId }, attributes: ['targetUrl'] });
    qrsToDelete.forEach(qr => cleanupUploadedFile(qr.targetUrl));

    const deleted = await QRCode.destroy({ where: { id: ids, userId } });
    logger.info('Batch delete QR codes', { userId, count: deleted });

    res.json({ success: true, message: `${deleted} QR code(s) deleted.`, count: deleted });
  } catch (error) {
    logger.error("Batch delete failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to batch delete." });
  }
};

export const getRecentScans = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const userQRs = await QRCode.findAll({
      where: { userId },
      attributes: ['id'],
      raw: true,
    });
    const qrIds = userQRs.map(q => q.id);

    if (qrIds.length === 0) {
      return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    const { Op } = await import('sequelize');
    const { count, rows: scans } = await ScanEvent.findAndCountAll({
      where: { qrCodeId: { [Op.in]: qrIds } },
      include: [{
        model: QRCode,
        as: 'qrCode',
        attributes: ['title', 'shortId', 'qrType'],
      }],
      order: [['scannedAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: scans.map(s => ({
        id: s.id,
        qrTitle: s.qrCode?.title,
        qrType: s.qrCode?.qrType,
        shortId: s.qrCode?.shortId,
        country: s.country,
        city: s.city,
        browser: s.browser,
        os: s.os,
        deviceType: s.deviceType,
        scannedAt: s.scannedAt,
      })),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error("Recent scans fetch failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to fetch recent scans." });
  }
};

export const archiveQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const qrCode = await QRCode.findOne({ where: { id, userId } });
    if (!qrCode) {
      return res.status(404).json({ success: false, message: "QR Code not found." });
    }

    qrCode.isArchived = !qrCode.isArchived;
    await qrCode.save();

    logger.info(`QR code ${qrCode.isArchived ? 'archived' : 'restored'}`, { userId, qrId: id });
    res.json({ success: true, data: { isArchived: qrCode.isArchived }, message: qrCode.isArchived ? 'QR code archived' : 'QR code restored' });
  } catch (error) {
    logger.error("Archive QR code failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to archive QR code." });
  }
};

export const bulkCreateQRCodes = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items array is required." });
    }
    if (items.length > 100) {
      return res.status(400).json({ success: false, message: "Maximum 100 QR codes per batch." });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const results = [];

    for (const item of items) {
      const shortId = crypto.randomBytes(4).toString("hex");
      const newQR = await QRCode.create({
        userId,
        title: item.title || "Untitled QR",
        qrType: item.qrType || "Website",
        shortId,
        targetUrl: item.targetUrl || item.url || null,
        content: item.content ? JSON.stringify(item.content) : null,
        description: item.description || null,
      });
      results.push({ ...newQR.toJSON(), qrLink: `${baseUrl}/q/${shortId}` });
    }

    logger.info('Bulk QR codes created', { userId, count: results.length });
    res.status(201).json({ success: true, data: results, count: results.length });
  } catch (error) {
    logger.error("Bulk QR creation failed", { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: "Failed to create QR codes." });
  }
};

export const getPublicQR = async (req, res) => {
  try {
    const { shortId } = req.params;

    const qrCode = await QRCode.findOne({
      where: { shortId, isActive: true },
      attributes: ["title", "qrType", "content"],
    });

    if (!qrCode) {
      return res.status(404).json({ success: false, message: "QR Code not found" });
    }

    let parsedContent = null;
    if (qrCode.content) {
      parsedContent = typeof qrCode.content === "string" ? JSON.parse(qrCode.content) : qrCode.content;
    }

    res.status(200).json({
      success: true,
      data: { ...qrCode.toJSON(), content: parsedContent },
    });
  } catch (error) {
    logger.error("Fetch public QR failed", { shortId: req.params?.shortId, error: error.message });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
