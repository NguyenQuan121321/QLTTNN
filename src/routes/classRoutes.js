const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const classController = require('../controllers/classController'); 
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Mọi người (đã login) có thể xem
// (CẬP NHẬT) dùng classController (viết thường)
router.get('/', verifyToken, classController.getAllClasses);
router.get('/:id', verifyToken, classController.getClassById);

// Chỉ ADMIN được sửa/xóa/thêm
router.post('/', verifyToken, requireRole(['ADMIN']), classController.createClass);
router.put('/:id', verifyToken, requireRole(['ADMIN']), classController.updateClass);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), classController.deleteClass);

module.exports = router;