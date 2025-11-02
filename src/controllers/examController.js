// (MỚI) Gọi Model
const examModel = require('../models/examModel');
// (Optional) Gọi classModel nếu cần kiểm tra lớp tồn tại
// const classModel = require('../models/classModel');

/**
 * 📋 Lấy danh sách kỳ thi (có thể lọc theo lớp)
 */
exports.getAllExams = async (req, res) => {
  try {
    const exams = await examModel.findAll(req.query); // Truyền query params để lọc
    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('❌ Lỗi getAllExams:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách kỳ thi' });
  }
};

/**
 * 🔍 Lấy chi tiết kỳ thi (kèm kết quả)
 */
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await examModel.findById(id);

    if (!exam)
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });

    res.json({ success: true, data: exam });
  } catch (err) {
    console.error('❌ Lỗi getExamById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin kỳ thi' });
  }
};

/**
 * ➕ Thêm mới kỳ thi
 */
exports.createExam = async (req, res) => {
  try {
     // (Optional but good practice) Validate if lopHocId exists before calling model
     // const { lopHocId } = req.body;
     // if (lopHocId) {
     //    const lop = await classModel.findById(lopHocId); // Use findById from classModel
     //    if (!lop) {
     //       return res.status(400).json({ success: false, message: `Lớp học với ID ${lopHocId} không tồn tại` });
     //    }
     // }

    const [newExamId] = await examModel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo kỳ thi thành công',
      id: newExamId
    });
  } catch (err) {
    console.error('❌ Lỗi createExam:', err);
     if (err.message.includes('Thiếu tên kỳ thi')) {
        return res.status(400).json({ success: false, message: err.message });
     }
    // Handle other specific errors from model if needed
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo kỳ thi' });
  }
};

/**
 * ✏️ Cập nhật kỳ thi
 */
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await examModel.update(id, req.body);

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi để cập nhật' });

    res.json({ success: true, message: 'Cập nhật kỳ thi thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateExam:', err);
    // Handle specific errors from model if needed
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật kỳ thi' });
  }
};

/**
 * 🗑️ Xóa kỳ thi
 */
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await examModel.remove(id);

    if (!deleted)
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi để xóa' });

    res.json({ success: true, message: 'Xóa kỳ thi thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteExam:', err);
     // Handle potential foreign key constraint errors if ON DELETE RESTRICT is used
     if (err.code && err.code.includes('ER_ROW_IS_REFERENCED')) { // Example error code
        return res.status(400).json({ success: false, message: 'Không thể xóa kỳ thi vì đã có kết quả thi liên quan.' });
     }
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa kỳ thi' });
  }
};