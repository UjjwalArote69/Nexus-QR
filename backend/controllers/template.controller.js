import Template from '../models/template.model.js';
import logger from '../config/logger.js';

export const createTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, fgColor, bgColor, isDefault } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Template name is required.' });
    }

    if (isDefault) {
      await Template.update({ isDefault: false }, { where: { userId, isDefault: true } });
    }

    const template = await Template.create({
      userId,
      name,
      fgColor: fgColor || '#000000',
      bgColor: bgColor || '#ffffff',
      isDefault: isDefault || false,
    });

    logger.info('Template created', { userId, templateId: template.id, name });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    logger.error('Template creation failed', { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create template.' });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const templates = await Template.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({ success: true, data: templates });
  } catch (error) {
    logger.error('Fetch templates failed', { userId: req.user?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch templates.' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, fgColor, bgColor, isDefault } = req.body;

    const template = await Template.findOne({ where: { id, userId } });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    if (isDefault && !template.isDefault) {
      await Template.update({ isDefault: false }, { where: { userId, isDefault: true } });
    }

    if (name !== undefined) template.name = name;
    if (fgColor !== undefined) template.fgColor = fgColor;
    if (bgColor !== undefined) template.bgColor = bgColor;
    if (isDefault !== undefined) template.isDefault = isDefault;

    await template.save();
    logger.info('Template updated', { userId, templateId: id });

    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Template update failed', { userId: req.user?.id, templateId: req.params?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update template.' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const template = await Template.findOne({ where: { id, userId } });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    await template.destroy();
    logger.info('Template deleted', { userId, templateId: id });

    res.json({ success: true, message: 'Template deleted.' });
  } catch (error) {
    logger.error('Template deletion failed', { userId: req.user?.id, templateId: req.params?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to delete template.' });
  }
};

export const applyTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const template = await Template.findOne({ where: { id, userId } });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    await template.increment('usedCount');

    res.json({
      success: true,
      data: {
        fgColor: template.fgColor,
        bgColor: template.bgColor,
        name: template.name,
      },
    });
  } catch (error) {
    logger.error('Template apply failed', { userId: req.user?.id, templateId: req.params?.id, error: error.message });
    res.status(500).json({ success: false, message: 'Failed to apply template.' });
  }
};
