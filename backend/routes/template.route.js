import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, createTemplateSchema, updateTemplateSchema } from '../middleware/validator.middleware.js';
import {
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
} from '../controllers/template.controller.js';

const router = express.Router();

router.post('/', protect, validate(createTemplateSchema), createTemplate);
router.get('/', protect, getTemplates);
router.put('/:id', protect, validate(updateTemplateSchema), updateTemplate);
router.delete('/:id', protect, deleteTemplate);
router.post('/:id/apply', protect, applyTemplate);

export default router;
