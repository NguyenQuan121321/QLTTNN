const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Giáo viên và Admin có thể điểm danh
// (CẬP NHẬT) dùng attendanceController (viết thường)
router.post('/', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), attendanceController.recordAttendance);

// Giáo viên và Admin có thể xem
router.get('/class/:lopHocId', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), attendanceController.getAttendanceByClass);
router.get('/status/:lopHocId/:hocVienId', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), attendanceController.getAttendanceStatus);

module.exports = router;