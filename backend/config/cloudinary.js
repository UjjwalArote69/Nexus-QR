import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Explicitly handle PDFs
    if (file.mimetype === 'application/pdf') {
      return {
        folder: 'nexusqr_uploads',
        format: 'pdf', 
        resource_type: 'image', 
      };
    }
    
    // 2. NEW: Explicitly handle Videos / audio
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      return {
        folder: 'nexusqr_uploads',
        resource_type: 'video', // Cloudinary requires 'video' for audio files too!
        allowed_formats: ['mp4', 'webm', 'mov', 'ogg', 'mp3', 'wav', 'mpeg'] // Added mp3, wav
      };
    }
    
    // 3. Handle standard Images
    return {
      folder: 'nexusqr_uploads',
      allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
      resource_type: 'image'
    };
  },
});

export const upload = multer({ storage: storage });