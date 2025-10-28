const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * 🧑‍💼 Lấy danh sách tất cả người dùng
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db('User').select('id', 'username', 'email', 'role');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Lỗi getAllUsers:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng' });
  }
};

/**
 * 🔍 Lấy thông tin chi tiết 1 người dùng
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db('User').where({ id }).first();

    if (!user)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Lỗi getUserById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * ➕ Thêm mới người dùng (Admin)
 */
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password' });

    const hash = await bcrypt.hash(password, 10);

    const [newUserId] = await db('User').insert({
      username,
      password: hash,
      email,
      role: role || 'STUDENT',
      status: 'ACTIVE'
    });

    res.status(201).json({ success: true, message: 'Thêm người dùng thành công', id: newUserId });
  } catch (err) {
    console.error('Lỗi createUser:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm người dùng' });
  }
};

/**
 * ✏️ Cập nhật người dùng
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, status } = req.body;

    const updated = await db('User').where({ id }).update({
      username,
      email,
      role,
      status
    });

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để cập nhật' });

    res.json({ success: true, message: 'Cập nhật người dùng thành công' });
  } catch (err) {
    console.error('Lỗi updateUser:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🚫 Xóa (hoặc khóa) người dùng
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Thay vì xóa hẳn, bạn có thể chỉ khóa tài khoản
    const deleted = await db('User').where({ id }).update({ status: 'INACTIVE' });

    if (!deleted)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    res.json({ success: true, message: 'Đã khóa tài khoản người dùng' });
  } catch (err) {
    console.error('Lỗi deleteUser:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa người dùng' });
  }
};