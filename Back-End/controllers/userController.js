// controllers/userController.js
const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyPattern)[0];
      res.status(400).json({ message: `El ${duplicatedField} ya está registrado.` });
    } else {
      console.error(err);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
};


exports.updateUser = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Usuario eliminado' });
};


exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error });
  }
};
