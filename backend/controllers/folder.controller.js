import Folder from '../models/folder.model.js';
import QRCode from '../models/qrcode.model.js';
import logger from '../config/logger.js';

export const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.findAll({
      where: { userId },
      order: [['name', 'ASC']],
    });

    // Get QR count per folder
    const folderIds = folders.map(f => f.id);
    const { Op } = await import('sequelize');
    const counts = await QRCode.findAll({
      where: { userId, folderId: { [Op.in]: folderIds } },
      attributes: ['folderId', [QRCode.sequelize.fn('COUNT', QRCode.sequelize.col('id')), 'count']],
      group: ['folderId'],
      raw: true,
    });

    const countMap = {};
    counts.forEach(c => { countMap[c.folderId] = parseInt(c.count); });

    const data = folders.map(f => ({
      ...f.toJSON(),
      qrCount: countMap[f.id] || 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Fetch folders failed', { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch folders.' });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required.' });
    }

    const folder = await Folder.create({
      userId,
      name: name.trim(),
      color: color || '#3b82f6',
    });

    logger.info('Folder created', { userId, folderId: folder.id });
    res.status(201).json({ success: true, data: { ...folder.toJSON(), qrCount: 0 } });
  } catch (error) {
    logger.error('Create folder failed', { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create folder.' });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.id;

    const folder = await Folder.findOne({ where: { id, userId } });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    if (name !== undefined) folder.name = name.trim();
    if (color !== undefined) folder.color = color;
    await folder.save();

    logger.info('Folder updated', { userId, folderId: id });
    res.json({ success: true, data: folder });
  } catch (error) {
    logger.error('Update folder failed', { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update folder.' });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await Folder.findOne({ where: { id, userId } });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    // Unassign QR codes from this folder (don't delete them)
    await QRCode.update({ folderId: null }, { where: { folderId: id, userId } });
    await folder.destroy();

    logger.info('Folder deleted', { userId, folderId: id });
    res.json({ success: true, message: 'Folder deleted. QR codes have been unassigned.' });
  } catch (error) {
    logger.error('Delete folder failed', { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to delete folder.' });
  }
};
