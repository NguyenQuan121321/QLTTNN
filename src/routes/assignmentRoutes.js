const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Chỉ ADMIN và GIAOVIEN được tạo, sửa, xóa bài tập
router.post('/', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), assignmentController.createAssignment);
router.put('/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), assignmentController.updateAssignment);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), assignmentController.deleteAssignment);

// Tất cả các role (đã login) đều có thể xem bài tập
// (Logic kiểm tra học viên có thuộc lớp không sẽ nằm trong controller)
router.get('/class/:lopHocId', verifyToken, assignmentController.getAssignmentsByClass);
router.get('/:id', verifyToken, assignmentController.getAssignmentById);

module.exports = router;