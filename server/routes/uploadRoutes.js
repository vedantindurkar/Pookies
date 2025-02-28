const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const imgbbUploader = require("imgbb-uploader");
require("dotenv").config();
//const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Define allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Set up Multer storage with file type and size validation

// Set up Multer storage with file type and size validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
});


// Image upload endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload image to ImgBB
    const response = await imgbbUploader(
      process.env.IMGBB_API_KEY,
      req.file.path
    );

    // Delete the local file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: response.url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
});

module.exports = router;
