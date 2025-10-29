const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const examController = require('../controllers/examController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// ADMIN/GIAOVIEN có thể xem
// (CẬP NHẬT) dùng examController (viết thường)
router.get('/', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), examController.getAllExams);
router.get('/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), examController.getExamById);

// Chỉ ADMIN được sửa/xóa/thêm
router.post('/', verifyToken, requireRole(['ADMIN']), examController.createExam);
router.put('/:id', verifyToken, requireRole(['ADMIN']), examController.updateExam);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), examController.deleteExam);

module.exports = router;