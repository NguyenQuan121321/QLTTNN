const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/UserController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Các route CRUD cho user
router.get('/', verifyToken, userCtrl.getAllUsers);
router.get('/:id', verifyToken, userCtrl.getUserById);
router.post('/', verifyToken, userCtrl.createUser);
router.put('/:id', verifyToken, userCtrl.updateUser);
router.delete('/:id', verifyToken, userCtrl.deleteUser);

module.exports = router;