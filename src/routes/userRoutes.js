const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Chỉ ADMIN mới được quản lý user
// (CẬP NHẬT) dùng userController (viết thường)
router.get('/', verifyToken, requireRole(['ADMIN']), userController.getAllUsers);
router.get('/:id', verifyToken, requireRole(['ADMIN']), userController.getUserById);
router.post('/', verifyToken, requireRole(['ADMIN']), userController.createUser);
router.put('/:id', verifyToken, requireRole(['ADMIN']), userController.updateUser);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), userController.deleteUser); // Hàm này giờ là soft delete

module.exports = router;