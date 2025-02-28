const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const imgbbUploader = require("imgbb-uploader");
const User = require("../models/User"); // Ensure you import the User model
const authMiddleware = require("./authMiddleware"); // Import auth middleware
require("dotenv").config();

const router = express.Router();

// Define allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Set up Multer storage
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
});

// ⬇️ Route to handle image upload (Optional)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = null;

    // Upload image if provided
    if (req.file) {
      const response = await imgbbUploader(
        process.env.IMGBB_API_KEY,
        req.file.path
      );
      imageUrl = response.url;
      fs.unlinkSync(req.file.path); // Delete local file after upload
    }

    res.status(200).json({
      message: "Upload successful",
      imageUrl: imageUrl || "No image uploaded", // Handle optional image case
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// ⬇️ Route to update profile image (Requires Authorization)
router.put(
  "/update-image/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.params.id;

      if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
      }

      const response = await imgbbUploader(
        process.env.IMGBB_API_KEY,
        req.file.path
      );
      fs.unlinkSync(req.file.path);

      // Update user profile image
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: response.url },
        { new: true }
      );

      res.status(200).json({
        message: "Profile image updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Image update failed", error: error.message });
    }
  }
);

// ⬇️ Route to delete profile image (Requires Authorization)
router.delete("/delete-image/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user and remove profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: null },
      { new: true }
    );

    res.status(200).json({
      message: "Profile image deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Image deletion failed", error: error.message });
  }
});

module.exports = router;
