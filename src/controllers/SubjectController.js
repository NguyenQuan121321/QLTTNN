const db = require("../config/database");

// Lấy tất cả môn học
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await db("MonHoc").select("*");
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy môn học" });
  }
};

// Lấy môn học theo ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await db("MonHoc").where("maMonHoc", req.params.id).first();
    if (!subject) return res.status(404).json({ success: false, message: "Không tìm thấy môn học" });
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy môn học" });
  }
};

// Tạo môn học
exports.createSubject = async (req, res) => {
  try {
    const { maMonHoc, tenMonHoc, moTa, heDaoTao } = req.body;
    await db("MonHoc").insert({ maMonHoc, tenMonHoc, moTa, heDaoTao });
    res.status(201).json({ success: true, message: "Tạo môn học thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi tạo môn học" });
  }
};

// Cập nhật môn học
exports.updateSubject = async (req, res) => {
  try {
    const { tenMonHoc, moTa, heDaoTao } = req.body;
    const updated = await db("MonHoc").where("maMonHoc", req.params.id).update({ tenMonHoc, moTa, heDaoTao });
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy môn học để cập nhật" });
    res.json({ success: true, message: "Cập nhật môn học thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật môn học" });
  }
};

// Xóa môn học
exports.deleteSubject = async (req, res) => {
  try {
    const deleted = await db("MonHoc").where("maMonHoc", req.params.id).del();
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy môn học để xóa" });
    res.json({ success: true, message: "Xóa môn học thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi xóa môn học" });
  }
};
