// (MỚI) Gọi Model thay vì gọi 'db'
const studentModel = require('../models/studentModel');

/**
 * 📋 Lấy danh sách tất cả học viên
 */
exports.getAllStudents = async (req, res) => {
  try {
    // Controller chỉ "nhờ" Model lấy dữ liệu
    const students = await studentModel.findAll();
    res.json({ success: true, data: students });
  } catch (err) {
    console.error('❌ Lỗi getAllStudents:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách học viên' });
  }
};

/**
 * 🔍 Lấy thông tin chi tiết học viên
 */
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Controller chỉ "nhờ" Model lấy dữ liệu
    const student = await studentModel.findById(id);

    // Controller xử lý việc phản hồi
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });
    }
    
    res.json({ success: true, data: student });
    
  } catch (err) {
    console.error('❌ Lỗi getStudentById (chi tiết):', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin chi tiết học viên' });
  }
};

/**
 * ➕ Thêm mới học viên
 */
exports.createStudent = async (req, res) => {
  try {
    // Controller lấy dữ liệu từ request body
    const studentData = req.body;
    
    // Controller "nhờ" Model tạo
    const newStudent = await studentModel.create(studentData);

    res.status(201).json({
      success: true,
      message: 'Thêm học viên thành công',
      id: newStudent.id
    });
  } catch (err) {
    console.error('❌ Lỗi createStudent:', err);
    // (MỚI) Xử lý lỗi (ví dụ: Trùng lặp) mà Model đã ném ra
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập (username) hoặc email đã tồn tại' });
    }
    if (err.message.includes('Thiếu Tên đăng nhập')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm học viên' });
  }
};

/**
 * ✏️ Cập nhật thông tin học viên
 */
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = req.body;

    // Controller "nhờ" Model cập nhật
    await studentModel.update(id, studentData);

    res.json({ success: true, message: 'Cập nhật học viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateStudent:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật học viên' });
  }
};

/**
 * 🚫 Khóa học viên
 */
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Controller "nhờ" Model khóa
    await studentModel.remove(id);

    res.json({ success: true, message: 'Đã khóa học viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteStudent:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi khóa học viên' });
  }
};