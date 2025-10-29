// Gọi Model
const classModel = require('../models/classModel');

/**
 * 📋 Lấy danh sách lớp học (hỗ trợ lọc)
 */
exports.getAllClasses = async (req, res) => {
  try {
    // Truyền query params (req.query) vào model để lọc
    const classes = await classModel.findAll(req.query);
    res.json({ success: true, data: classes });
  } catch (err) {
    console.error('❌ Lỗi getAllClasses:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách lớp học' });
  }
};

/**
 * 🔍 Lấy chi tiết lớp học (Kèm DSHV và Học phí)
 */
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const lop = await classModel.findById(id);

    if (!lop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    res.json({ success: true, data: lop });
  } catch (err) {
    console.error('❌ Lỗi getClassById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy lớp học' });
  }
};

/**
 * ➕ Tạo lớp học
 */
exports.createClass = async (req, res) => {
  try {
    const [classId] = await classModel.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo lớp học thành công', id: classId });
  } catch (err) {
    console.error('❌ Lỗi createClass:', err);
    // Xử lý lỗi từ Model
    if (err.message.includes('Sĩ số')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo lớp học' });
  }
};

/**
 * ✏️ Cập nhật lớp học
 */
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await classModel.update(id, req.body);

    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để cập nhật' });

    res.json({ success: true, message: 'Cập nhật lớp học thành công' });
  } catch (err)
 {
    console.error('❌ Lỗi updateClass:', err);
     if (err.message.includes('Sĩ số')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật lớp học' });
  }
};

/**
 * 🚫 Đóng lớp học (xóa mềm)
 */
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await classModel.remove(id);

    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để đóng' });

    res.json({ success: true, message: 'Đã đóng lớp học thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteClass:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa lớp học' });
  }
};