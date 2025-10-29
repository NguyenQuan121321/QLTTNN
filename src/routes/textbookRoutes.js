const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const textbookController = require('../controllers/textbookController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Admin và Giáo viên có thể xem
router.get('/', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), textbookController.getAllTextbooks);
router.get('/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), textbookController.getTextbookById);

// Chỉ Admin có thể sửa/xóa/thêm
router.post('/', verifyToken, requireRole(['ADMIN']), textbookController.createTextbook);
router.put('/:id', verifyToken, requireRole(['ADMIN']), textbookController.updateTextbook);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), textbookController.deleteTextbook);

module.exports = router;