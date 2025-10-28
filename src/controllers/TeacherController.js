const db = require('../config/database');

/**
 * 📋 Lấy danh sách giáo viên
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await db('GiaoVien')
      .join('User', 'GiaoVien.id', '=', 'User.id')
      .select(
        'GiaoVien.id',
        'User.fullName',
        'User.email',
        'User.phone',
        'GiaoVien.maGV',
        'GiaoVien.chuyenMon',
        'GiaoVien.status',
        'GiaoVien.joinedDate'
      );

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
    const teacher = await db('GiaoVien')
      .join('User', 'GiaoVien.id', '=', 'User.id')
      .where('GiaoVien.id', id)
      .first();

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
    const { username, password, fullName, email, phone, chuyenMon, degree } = req.body;

    const [userId] = await db('User').insert({
      username,
      password,
      role: 'GIAOVIEN',
      fullName,
      email,
      phone
    });

    await db('GiaoVien').insert({
      id: userId,
      maGV: `GV${Date.now()}`,
      joinedDate: new Date(),
      chuyenMon,
      degree,
      status: 'active'
    });

    res.status(201).json({ success: true, message: 'Thêm giáo viên thành công', id: userId });
  } catch (err) {
    console.error('❌ Lỗi createTeacher:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm giáo viên' });
  }
};

/**
 * ✏️ Cập nhật thông tin giáo viên
 */
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, chuyenMon, degree, status } = req.body;

    await db('User').where({ id }).update({ fullName, email, phone });
    await db('GiaoVien').where({ id }).update({ chuyenMon, degree, status });

    res.json({ success: true, message: 'Cập nhật giáo viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateTeacher:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật giáo viên' });
  }
};

/**
 * 🚫 Khóa giáo viên
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await db('GiaoVien').where({ id }).update({ status: 'inactive' });
    await db('User').where({ id }).update({ isActive: false });

    res.json({ success: true, message: 'Đã khóa giáo viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteTeacher:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi khóa giáo viên' });
  }
};