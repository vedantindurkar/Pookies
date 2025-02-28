const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  partnerEmail: { type: String, required: true, unique: true },
  profileImage: { type: String, default: "" }, // Optional, default empty
});

module.exports = mongoose.model("User", UserSchema);
