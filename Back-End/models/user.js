// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  date: String,
  gender: String,
  url: String
});

module.exports = mongoose.model('User', userSchema);
