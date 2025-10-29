const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const feeController = require('../controllers/feeController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Chỉ ADMIN mới được quản lý học phí
// (CẬP NHẬT) dùng feeController (viết thường)
router.post('/create', verifyToken, requireRole(['ADMIN']), feeController.createFee);
router.post('/payment', verifyToken, requireRole(['ADMIN']), feeController.recordPayment);
router.post('/check-overdue', verifyToken, requireRole(['ADMIN']), feeController.checkAndLockOverdueAccounts);

// TODO: Thêm các route GET để xem học phí (ví dụ: theo học viên, theo lớp)

module.exports = router;