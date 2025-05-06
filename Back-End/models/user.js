const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  gender: { type: String, default: '' },  // lo puedes dejar vacío si aún no lo usas
  url: { type: String, default: '' },     // URL de foto de perfil
  score: { type: Number, default: 0 }     // para el sistema de puntos
});

module.exports = mongoose.model('User', userSchema);
