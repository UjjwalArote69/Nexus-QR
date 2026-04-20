import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "../models/qrcode.model.js";
import ScanEvent from "../models/scanEvent.model.js";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import logger from "../config/logger.js";
import { sendEmail, isSmtpReady } from "../config/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Helper: delete uploaded file if the QR's targetUrl points to a local upload
function cleanupUploadedFile(targetUrl) {
  if (!targetUrl) return;
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  if (targetUrl.startsWith(`${baseUrl}/uploads/`)) {
    // BUG-002 fix: use path.basename to prevent path traversal attacks
    const rawFilename = targetUrl.replace(`${baseUrl}/uploads/`, '');
    const filename = path.basename(rawFilename);
    const filePath = path.join(uploadsDir, filename);
    // Verify resolved path is still within uploadsDir
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(uploadsDir))) {
      logger.warn('Path traversal attempt blocked', { targetUrl, resolvedPath });
      return;
    }
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

    // Support custom slugs — validate uniqueness (format validated by schema middleware)
    let shortId;
    if (customSlug) {
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

    // BUG-004 fix: use transaction to prevent race condition
    const { sequelize } = await import('../config/db.js');
    const result = await sequelize.transaction(async (t) => {
      const [claimedCount] = await QRCode.update(
        { userId, sessionToken: null },
        { where: { sessionToken, userId: null }, transaction: t }
      );
      return claimedCount;
    });
    const claimedCount = result;
 
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
    logger.error('Claim QR Codes Error:', { error: error.message });
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

    // Email QR: send via SMTP
    if (qrCode.qrType === 'Email') {
      // Check SMTP is actually configured
      if (!isSmtpReady()) {
        logger.error('Email QR scan but SMTP not configured', { shortId });
        return res.status(503).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email Unavailable</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;max-width:360px;padding:24px"><h1 style="color:#0f172a;font-size:20px;margin:0 0 8px">Email Service Unavailable</h1><p style="color:#64748b;font-size:14px;margin:0">The email service is not configured. Please contact the QR code owner.</p></div></body></html>`);
      }

      try {
        // Parse email data from content
        let emailData = null;
        if (qrCode.content) {
          try {
            const parsed = typeof qrCode.content === 'string' ? JSON.parse(qrCode.content) : qrCode.content;
            // Handle structured content { email, subject, message }
            if (parsed && typeof parsed === 'object' && parsed.email) {
              emailData = parsed;
            }
          } catch {
            // Handle old mailto: string format stored in content
            const raw = typeof qrCode.content === 'string' ? qrCode.content.replace(/^"|"$/g, '') : '';
            if (raw.startsWith('mailto:')) {
              try {
                const url = new URL(raw);
                const params = new URLSearchParams(url.search);
                emailData = {
                  email: url.pathname,
                  subject: params.get('subject') || '',
                  message: params.get('body') || '',
                };
              } catch { emailData = null; }
            }
          }
        }

        if (!emailData || !emailData.email) {
          return res.status(400).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;padding:24px"><h1 style="color:#0f172a;font-size:20px">Invalid Email QR</h1><p style="color:#64748b;font-size:14px">This QR code is missing email data.</p></div></body></html>`);
        }

        const safeMessage = (emailData.message || 'No message provided.').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        await sendEmail({
          to: emailData.email,
          subject: emailData.subject || 'Message via QR Code',
          html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="color:#0f172a;margin:0 0 16px">New message from QR scan</h2><div style="background:#f8fafc;border-radius:8px;padding:16px;color:#334155;font-size:15px;line-height:1.6;white-space:pre-wrap">${safeMessage}</div><p style="color:#94a3b8;font-size:12px;margin-top:20px">Sent via Klink QR Code</p></div>`,
        });

        return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email Sent</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;max-width:360px;padding:24px"><div style="width:56px;height:56px;border-radius:50%;background:#ecfdf5;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="24" height="24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h1 style="color:#0f172a;font-size:20px;margin:0 0 8px">Email Sent</h1><p style="color:#64748b;font-size:14px;margin:0">Your message has been delivered successfully.</p></div></body></html>`);
      } catch (emailErr) {
        logger.error('Email QR send failed', { shortId, error: emailErr.message });
        return res.status(500).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;padding:24px"><h1 style="color:#0f172a;font-size:20px">Email Failed</h1><p style="color:#64748b;font-size:14px">Could not send the email. Please try again later.</p></div></body></html>`);
      }
    }

    // Static QR types (sms:, tel:, wifi:) can't use HTTP redirects.
    // Serve a small HTML page that triggers the native action via JavaScript.
    const url = qrCode.targetUrl;
    if (url && /^(sms:|tel:|WIFI:)/i.test(url)) {
      // HTML attribute context: escape &, ", <, >
      const htmlEscaped = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // JS string context: escape \, ', </ sequences (& must stay raw for JS)
      const jsEscaped = url.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/<\//g, '<\\/');
      return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Redirecting...</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center"><p style="color:#64748b;font-size:14px">Opening...</p><a href="${htmlEscaped}" id="link" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px">Open now</a></div><script>window.location.href='${jsEscaped}';</script></body></html>`);
    }

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
    // BUG-013 fix: validate targetUrl if provided
    if (targetUrl !== undefined) {
      if (targetUrl && typeof targetUrl === 'string' && targetUrl.trim()) {
        try {
          const parsed = new URL(targetUrl);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            return res.status(400).json({ success: false, message: "Target URL must use http or https protocol." });
          }
        } catch {
          return res.status(400).json({ success: false, message: "Invalid target URL format." });
        }
      }
      qrCode.targetUrl = targetUrl;
    }
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
      // BUG-003 fix: wrap JSON.parse in try-catch to prevent crash on malformed data
      try {
        parsedContent = typeof qrCode.content === "string" ? JSON.parse(qrCode.content) : qrCode.content;
      } catch (parseErr) {
        logger.warn("Malformed QR content JSON", { shortId, error: parseErr.message });
        parsedContent = null;
      }
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


export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded." });
    }
    
    // Check if the uploaded file has a cloudinary path or local filename
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const imageUrl = req.file.path && req.file.path.startsWith('http') 
      ? req.file.path 
      : `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    logger.error("Image upload failed", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to upload image." });
  }
};