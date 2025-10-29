const express = require("express");
const router = express.Router();
// (CẬP NHẬT) đổi tên file sang camelCase
const subjectController = require("../controllers/subjectController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware"); //

// (CẬP NHẬT) dùng subjectController (viết thường)
router.get("/", verifyToken, subjectController.getAllSubjects);
router.get("/:id", verifyToken, subjectController.getSubjectById); // :id là maMonHoc
// Chỉ ADMIN được sửa/xóa/thêm
router.post("/", verifyToken, requireRole(['ADMIN']), subjectController.createSubject);
router.put("/:id", verifyToken, requireRole(['ADMIN']), subjectController.updateSubject); // :id là maMonHoc
router.delete("/:id", verifyToken, requireRole(['ADMIN']), subjectController.deleteSubject); // :id là maMonHoc

module.exports = router;