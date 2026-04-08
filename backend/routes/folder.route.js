import express from 'express';
import { getFolders, createFolder, updateFolder, deleteFolder } from '../controllers/folder.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, createFolderSchema, updateFolderSchema } from '../middleware/validator.middleware.js';

const router = express.Router();

router.get('/', protect, getFolders);
router.post('/', protect, validate(createFolderSchema), createFolder);
router.put('/:id', protect, validate(updateFolderSchema), updateFolder);
router.delete('/:id', protect, deleteFolder);

export default router;
