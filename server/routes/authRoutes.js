const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();


const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, partnerEmail } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "Email already registered" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    user = new User({
      email,
      password: hashedPassword,
      partnerEmail,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;