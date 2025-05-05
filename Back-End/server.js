const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ⚠️ Servir archivos estáticos de Front-End
app.use(express.static(path.join(__dirname, '../Front-End')));

// ⚠️ Ruta raíz que carga home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front-End/home.html'));
});

// Rutas API
app.use('/api/users', userRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

