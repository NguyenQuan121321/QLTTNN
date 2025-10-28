const db = require('../config/database');

/**
 * 📋 Lấy danh sách tất cả kỳ thi
 */
exports.getAllExams = async (req, res) => {
  try {
    const exams = await db('Exam')
      .select('Exam.id', 'Exam.tenKyThi', 'Exam.ngayThi', 'LopHoc.tenLop')
      .leftJoin('LopHoc', 'Exam.lopHocId', 'LopHoc.id');

    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('❌ Lỗi getAllExams:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách kỳ thi' });
  }
};

/**
 * 🔍 Lấy chi tiết 1 kỳ thi
 */
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await db('Exam')
      .leftJoin('LopHoc', 'Exam.lopHocId', 'LopHoc.id')
      .select('Exam.*', 'LopHoc.tenLop')
      .where('Exam.id', id)
      .first();

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
    const { lopHocId, tenKyThi, ngayThi } = req.body;

    if (!lopHocId || !tenKyThi || !ngayThi)
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc' });

    // Kiểm tra lớp học có tồn tại không
    const lop = await db('LopHoc').where({ id: lopHocId }).first();
    if (!lop)
      return res.status(400).json({ success: false, message: `Lớp học với ID ${lopHocId} không tồn tại` });

    const [newExamId] = await db('Exam').insert({
      lopHocId,
      tenKyThi,
      ngayThi
    });

    res.status(201).json({
      success: true,
      message: 'Tạo kỳ thi thành công',
      id: newExamId
    });
  } catch (err) {
    console.error('❌ Lỗi createExam:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo kỳ thi' });
  }
};

/**
 * ✏️ Cập nhật kỳ thi
 */
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { lopHocId, tenKyThi, ngayThi } = req.body;

    const updated = await db('Exam').where({ id }).update({
      lopHocId,
      tenKyThi,
      ngayThi
    });

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi để cập nhật' });

    res.json({ success: true, message: 'Cập nhật kỳ thi thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateExam:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật kỳ thi' });
  }
};

/**
 * 🗑️ Xóa kỳ thi
 */
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('Exam').where({ id }).del();

    if (!deleted)
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi để xóa' });

    res.json({ success: true, message: 'Xóa kỳ thi thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteExam:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa kỳ thi' });
  }
};