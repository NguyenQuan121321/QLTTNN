// (MỚI) Gọi Model
const subjectModel = require("../models/subjectModel");

/**
 * 📋 Lấy tất cả môn học
 */
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await subjectModel.findAll();
    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error('❌ Lỗi getAllSubjects:', err);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy môn học" });
  }
};

/**
 * 🔍 Lấy môn học theo mã môn học
 */
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params; // 'id' là 'maMonHoc' từ route
    const subject = await subjectModel.findById(id);
    if (!subject) return res.status(404).json({ success: false, message: "Không tìm thấy môn học" });
    res.json({ success: true, data: subject });
  } catch (err) {
    console.error('❌ Lỗi getSubjectById:', err);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy môn học" });
  }
};

/**
 * ➕ Tạo môn học
 */
exports.createSubject = async (req, res) => {
  try {
    await subjectModel.create(req.body);
    res.status(201).json({ success: true, message: "Tạo môn học thành công" });
  } catch (err) {
    console.error('❌ Lỗi createSubject:', err);
    if (err.message.includes('là bắt buộc')) { // Lỗi validation từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'ER_DUP_ENTRY') { // Lỗi trùng mã môn
       return res.status(400).json({ success: false, message: `Mã môn học '${req.body.maMonHoc}' đã tồn tại.` });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi tạo môn học" });
  }
};

/**
 * ✏️ Cập nhật môn học
 */
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params; // 'id' là 'maMonHoc'
    const updated = await subjectModel.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy môn học để cập nhật" });
    res.json({ success: true, message: "Cập nhật môn học thành công" });
  } catch (err) {
    console.error('❌ Lỗi updateSubject:', err);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật môn học" });
  }
};

/**
 * 🗑️ Xóa môn học
 */
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params; // 'id' là 'maMonHoc'
    await subjectModel.remove(id);
    res.json({ success: true, message: "Xóa môn học thành công" });
  } catch (err) {
    console.error('❌ Lỗi deleteSubject:', err);
    if (err.message.includes('Không thể xóa môn học')) { // Lỗi ràng buộc từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi xóa môn học" });
  }
};