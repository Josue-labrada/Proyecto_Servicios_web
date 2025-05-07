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

exports.getUserFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.friends);
  } catch (error) {
    console.error("Error al obtener amigos:", error);
    res.status(500).json({ message: 'Error del servidor', error });
  }
};

exports.addFriend = async (req, res) => {
  const { userId, friendUsername } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ message: 'Usuario o amigo no encontrado' });
    }

    if (user._id.equals(friend._id)) {
      return res.status(400).json({ message: 'No puedes agregarte a ti mismo' });
    }

    if (user.friends && user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Ya son amigos' });
    }

    user.friends = user.friends || [];
    user.friends.push(friend._id);
    await user.save();

    res.status(200).json({ message: 'Amigo agregado correctamente', friend });
  } catch (err) {
    console.error("Error al agregar amigo:", err);
    res.status(500).json({ message: 'Error del servidor', err });
  }
};

exports.removeFriend = async (req, res) => {
  const { friendUsername } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) return res.status(404).json({ message: "Usuario o amigo no encontrado" });

    user.friends = user.friends.filter(f => f.toString() !== friend._id.toString());
    await user.save();

    res.json({ message: `Amigo ${friend.username} eliminado` });
  } catch (error) {
    console.error("Error eliminando amigo:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

exports.donatePoints = async (req, res) => {
  const { toUsername, points } = req.body;
  const fromId = req.params.id;

  try {
    const sender = await User.findById(fromId);
    const receiver = await User.findOne({ username: toUsername });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (sender.score < points) {
      return res.status(400).json({ message: "No tienes suficientes puntos para donar." });
    }

    sender.score -= points;
    receiver.score += points;

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Puntos donados exitosamente", sender, receiver });
  } catch (error) {
    console.error("Error al donar puntos:", error);
    res.status(500).json({ message: "Error del servidor", error });
  }
};
