const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
app.use(express.json());

// MongoDB connection
const mongoConnection = "mongodb+srv://admin:myserver1@cluster0.wlimmen.mongodb.net/JuegosCool";
mongoose.connect(mongoConnection, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('connecting', () => console.log('Conectando a MongoDB...'));
db.on('connected', () => console.log('¡Conectado exitosamente a MongoDB!'));
db.on('error', (error) => console.error('Error en la conexión:', error));

// User schema and model
const userSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    pass: { type: String, required: true },
    score: { type: Number, default: 0 }, // Field for user score
    edad: { type: Number, min: 0, max: 120, required: true }
});

const User = mongoose.model('users', userSchema);

// Create a new user
app.post('/api/users', (req, res) => {
    const newUser = new User(req.body);
    newUser.save()
        .then((doc) => res.status(201).json({ message: 'Usuario creado exitosamente', user: doc }))
        .catch((error) => res.status(400).json({ error: 'Error al crear usuario', details: error }));
});

// Get all users or search by name
app.get('/api/users', (req, res) => {
    const { nombre } = req.query;
    const query = nombre ? { nombre: { $regex: nombre, $options: 'i' } } : {};
    User.find(query)
        .then((docs) => res.json(docs))
        .catch((error) => res.status(500).json({ error: 'Error al consultar usuarios', details: error }));
});

// Update a user by ID
app.put('/api/users', (req, res) => {
    console.log("Actualizando información...");
    
    const { id, nombre, correo, edad, score } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del usuario para actualizar' });
    }

    const object_to_update = {};
    if (nombre !== undefined) object_to_update.nombre = nombre;
    if (correo !== undefined) object_to_update.correo = correo;
    if (edad !== undefined) object_to_update.edad = edad;
    if (score !== undefined) object_to_update.score = score;

    if (Object.keys(object_to_update).length === 0) {
        return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    User.findByIdAndUpdate(id, object_to_update, { new: true })
        .then((doc) => {
            if (doc) {
                console.log("Usuario actualizado:");
                console.log(doc);
                res.json({ message: 'Usuario actualizado exitosamente', user: doc });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar el usuario', details: err });
        });
});


// Delete a user by ID
app.delete('/api/users', (req, res) => {
    console.log("Delete request received with body:", req.body);
    const id = req.body.id;
    
    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del usuario para eliminar' });
    }
    
    User.findByIdAndDelete(id)
        .then((doc) => {
            if (doc) {
                console.log("Usuario eliminado:", doc);
                res.json({ message: 'Usuario eliminado exitosamente', user: doc });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        })
        .catch((err) => {
            console.error("Error deleting user:", err);
            res.status(500).json({ error: 'Error al eliminar el usuario', details: err.message });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});