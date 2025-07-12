const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  id: String,
  pass: String,
  name: String,
  role: String,
}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);