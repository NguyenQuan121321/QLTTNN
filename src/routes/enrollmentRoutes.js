const express = require('express');
const router = express.Router();
// Gọi controller vừa tạo
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Chỉ Admin mới được ghi danh, cập nhật, xóa
router.post('/', verifyToken, requireRole(['ADMIN']), enrollmentController.enrollStudent);
router.put('/:id/status', verifyToken, requireRole(['ADMIN']), enrollmentController.updateEnrollmentStatus); // Route cập nhật status
router.delete('/:id', verifyToken, requireRole(['ADMIN']), enrollmentController.deleteEnrollment); // Route hủy ghi danh

// Admin, Giáo viên (có thể cả Học viên?) được xem
router.get('/', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), enrollmentController.getAllEnrollments); // Lọc bằng query params ?studentId=1 hoặc ?classId=1
router.get('/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), enrollmentController.getEnrollmentById);

module.exports = router;