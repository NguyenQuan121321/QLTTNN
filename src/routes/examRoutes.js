const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');

// Các route kỳ thi
router.get('/', ExamController.getAllExams);
router.get('/:id', ExamController.getExamById);
router.post('/', ExamController.createExam);
router.put('/:id', ExamController.updateExam);
router.delete('/:id', ExamController.deleteExam);

module.exports = router;