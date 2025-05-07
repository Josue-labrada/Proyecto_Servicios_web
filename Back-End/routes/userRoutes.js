// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.loginUser);
router.get('/:id/friends', userController.getUserFriends);
router.post('/:id/add-friend', userController.addFriend);
router.post('/:id/remove-friend', userController.removeFriend);
router.post('/:id/donate', userController.donatePoints);




module.exports = router;
