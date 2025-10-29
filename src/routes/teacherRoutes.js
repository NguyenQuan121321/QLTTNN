const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const teacherController = require('../controllers/teacherController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Chỉ ADMIN được quản lý giáo viên
// (CẬP NHẬT) dùng teacherController (viết thường)
router.get('/', verifyToken, requireRole(['ADMIN']), teacherController.getAllTeachers);
router.get('/:id', verifyToken, requireRole(['ADMIN']), teacherController.getTeacherById);
router.post('/', verifyToken, requireRole(['ADMIN']), teacherController.createTeacher);
router.put('/:id', verifyToken, requireRole(['ADMIN']), teacherController.updateTeacher);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), teacherController.deleteTeacher); // Hàm này giờ là soft delete

module.exports = router;