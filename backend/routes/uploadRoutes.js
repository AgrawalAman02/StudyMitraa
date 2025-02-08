import express from 'express';
import upload from '../utils/multer.js';
import { uploadMedia } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file.path;
    const url = await uploadMedia(file);
    console.log(url);
    res.status(200).json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;