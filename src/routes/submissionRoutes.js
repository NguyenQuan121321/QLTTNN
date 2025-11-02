const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Chỉ HOCVIEN được nộp bài
// HOCVIEN và ADMIN được nộp bài
router.post('/', verifyToken, requireRole(['HOCVIEN', 'ADMIN']), submissionController.submitAssignment);

// Chỉ ADMIN và GIAOVIEN được chấm điểm
router.post('/grade/:id', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), submissionController.gradeSubmission);

// Chỉ ADMIN và GIAOVIEN xem được toàn bộ bài nộp của 1 assignment
router.get('/assignment/:baiTapId', verifyToken, requireRole(['ADMIN', 'GIAOVIEN']), submissionController.getSubmissionsByAssignment);

// HOCVIEN tự xem bài nộp của mình
// HOCVIEN và ADMIN được nộp bài
router.post('/', verifyToken, requireRole(['HOCVIEN', 'ADMIN']), submissionController.submitAssignment);
module.exports = router;