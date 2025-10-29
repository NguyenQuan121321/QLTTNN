const express = require('express');
const router = express.Router();
// Gọi controller vừa tạo
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// API lấy dữ liệu thống kê - Chỉ Admin được truy cập
router.get('/stats', verifyToken, requireRole(['ADMIN']), dashboardController.getDashboardStats);

// Có thể thêm các route khác cho dashboard nếu cần

module.exports = router;