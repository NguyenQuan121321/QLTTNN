const express = require('express');
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const certificateController = require('../controllers/certificateController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware'); //

// Mọi người (đã login) có thể xem
// (CẬP NHẬT) dùng certificateController (viết thường)
router.get('/', verifyToken, certificateController.getAllCertificates);
router.get('/:id', verifyToken, certificateController.getCertificateById);

// Chỉ ADMIN được sửa/xóa/thêm
router.post('/', verifyToken, requireRole(['ADMIN']), certificateController.createCertificate);
router.put('/:id', verifyToken, requireRole(['ADMIN']), certificateController.updateCertificate);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), certificateController.deleteCertificate); // Hàm này giờ là disable

module.exports = router;