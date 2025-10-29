const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const roomController = require('../controllers/roomController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Chỉ ADMIN mới được quản lý phòng học
// (CẬP NHẬT) dùng roomController (viết thường)
router.get('/', verifyToken, requireRole(['ADMIN']), roomController.getAllRooms);
router.get('/:id', verifyToken, requireRole(['ADMIN']), roomController.getRoomById); // :id ở đây là maPhong
router.post('/', verifyToken, requireRole(['ADMIN']), roomController.createRoom);
router.put('/:id', verifyToken, requireRole(['ADMIN']), roomController.updateRoom); // :id ở đây là maPhong
router.delete('/:id', verifyToken, requireRole(['ADMIN']), roomController.deleteRoom); // :id ở đây là maPhong

module.exports = router;