const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// ADMIN và GIAOVIEN có thể xem
router.get('/', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), StudentController.getAllStudents);
router.get('/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), StudentController.getStudentById);
// Chỉ ADMIN được sửa/xóa/thêm
router.post('/', verifyToken, requireRole(['ADMIN']), StudentController.createStudent);
router.put('/:id', verifyToken, requireRole(['ADMIN']), StudentController.updateStudent);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), StudentController.deleteStudent);

module.exports = router;