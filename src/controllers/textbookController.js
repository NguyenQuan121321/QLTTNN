// (MỚI) Gọi Model
const textbookModel = require('../models/textbookModel');
// (Optional) Gọi subjectModel để kiểm tra môn học tồn tại
const subjectModel = require('../models/subjectModel');

/**
 * 📋 Lấy tất cả giáo trình
 */
exports.getAllTextbooks = async (req, res) => {
  try {
    const textbooks = await textbookModel.findAll();
    res.json({ success: true, data: textbooks });
  } catch (err) {
    console.error('❌ Lỗi getAllTextbooks:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy giáo trình' });
  }
};

/**
 * 🔍 Lấy giáo trình theo ID
 */
exports.getTextbookById = async (req, res) => {
  try {
    const { id } = req.params;
    const textbook = await textbookModel.findById(id);
    if (!textbook) return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình' });
    res.json({ success: true, data: textbook });
  } catch (err) {
    console.error('❌ Lỗi getTextbookById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy giáo trình' });
  }
};

/**
 * ➕ Tạo giáo trình
 */
exports.createTextbook = async (req, res) => {
  try {
     // (Optional) Kiểm tra môn học tồn tại trước khi gọi model
     const { monHocId } = req.body;
     if (monHocId) {
        const subject = await subjectModel.findById(monHocId);
        if (!subject) {
            return res.status(400).json({ success: false, message: `Môn học với mã ${monHocId} không tồn tại` });
        }
     }

    await textbookModel.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo giáo trình thành công' });
  } catch (err) {
    console.error('❌ Lỗi createTextbook:', err);
    if (err.message.includes('là bắt buộc')) { // Lỗi validation từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo giáo trình' });
  }
};

/**
 * ✏️ Cập nhật giáo trình
 */
exports.updateTextbook = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await textbookModel.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình để cập nhật' });
    res.json({ success: true, message: 'Cập nhật giáo trình thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateTextbook:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật giáo trình' });
  }
};

/**
 * 🗑️ Xóa giáo trình
 */
exports.deleteTextbook = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await textbookModel.remove(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy giáo trình để xóa' });
    res.json({ success: true, message: 'Xóa giáo trình thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteTextbook:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa giáo trình' });
  }
};