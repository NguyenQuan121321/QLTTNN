// (MỚI) Gọi Model
const teacherModel = require('../models/teacherModel');

/**
 * 📋 Lấy danh sách giáo viên
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherModel.findAll();
    res.json({ success: true, data: teachers });
  } catch (err) {
    console.error('❌ Lỗi getAllTeachers:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách giáo viên' });
  }
};

/**
 * 🔍 Lấy thông tin chi tiết giáo viên
 */
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await teacherModel.findById(id);

    if (!teacher)
      return res.status(404).json({ success: false, message: 'Không tìm thấy giáo viên' });

    res.json({ success: true, data: teacher });
  } catch (err) {
    console.error('❌ Lỗi getTeacherById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin giáo viên' });
  }
};

/**
 * ➕ Thêm mới giáo viên
 */
exports.createTeacher = async (req, res) => {
  try {
    // TODO: Hash password trước khi gọi model.create
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // const teacherData = { ...req.body, password: hashedPassword };

    const teacherData = req.body; // Tạm thời chưa hash
    const newTeacher = await teacherModel.create(teacherData);

    res.status(201).json({ success: true, message: 'Thêm giáo viên thành công', id: newTeacher.id });
  } catch (err) {
    console.error('❌ Lỗi createTeacher:', err);
    if (err.message.includes('là bắt buộc')) { // Lỗi validation từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'ER_DUP_ENTRY') { // Lỗi trùng username/email
       return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm giáo viên' });
  }
};

/**
 * ✏️ Cập nhật thông tin giáo viên
 */
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await teacherModel.update(id, req.body);
    res.json({ success: true, message: 'Cập nhật giáo viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateTeacher:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật giáo viên' });
  }
};

/**
 * 🚫 Khóa giáo viên (Soft delete)
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await teacherModel.remove(id);
    res.json({ success: true, message: 'Đã khóa giáo viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteTeacher:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi khóa giáo viên' });
  }
};