const db = require('../config/database');

/**
 * 📋 Lấy danh sách tất cả học viên
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await db('HocVien')
      .join('User', 'HocVien.id', '=', 'User.id')
      .select(
        'HocVien.id',
        'User.username',
        'User.fullName',
        'User.email',
        'User.phone',
        'HocVien.code',
        'HocVien.address',
        'HocVien.registrationDate',
        'HocVien.status'
      );

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
    const student = await db('HocVien')
      .join('User', 'HocVien.id', '=', 'User.id')
      .where('HocVien.id', id)
      .first();

    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });

    res.json({ success: true, data: student });
  } catch (err) {
    console.error('❌ Lỗi getStudentById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin học viên' });
  }
};

/**
 * ➕ Thêm mới học viên (kèm tài khoản User)
 */
exports.createStudent = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, address, guardianName, guardianPhone } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password' });

    // 1. Tạo User
    const [userId] = await db('User').insert({
      username,
      password,
      role: 'HOCVIEN',
      fullName,
      email,
      phone
    });

    // 2. Tạo HocVien
    const [hocVienId] = await db('HocVien').insert({
      id: userId,
      code: `HV${Date.now()}`,
      address,
      registrationDate: new Date(),
      status: 'active',
      guardianName,
      guardianPhone
    });

    res.status(201).json({
      success: true,
      message: 'Thêm học viên thành công',
      id: hocVienId
    });
  } catch (err) {
    console.error('❌ Lỗi createStudent:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm học viên' });
  }
};

/**
 * ✏️ Cập nhật thông tin học viên
 */
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, address, status } = req.body;

    await db('User').where({ id }).update({ fullName, email, phone });
    await db('HocVien').where({ id }).update({ address, status });

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
    await db('HocVien').where({ id }).update({ status: 'inactive' });
    await db('User').where({ id }).update({ isActive: false });

    res.json({ success: true, message: 'Đã khóa học viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteStudent:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi khóa học viên' });
  }
};