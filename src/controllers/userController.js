// (MỚI) Gọi Model
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs'); // Vẫn cần bcrypt ở đây để hash

/**
 * 🧑‍💼 Lấy danh sách tất cả người dùng
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('❌ Lỗi getAllUsers:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng' });
  }
};

/**
 * 🔍 Lấy thông tin chi tiết 1 người dùng
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    // Không trả về password hash
    const { password, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (err) {
    console.error('❌ Lỗi getUserById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin người dùng' });
  }
};

/**
 * ➕ Thêm mới người dùng (Admin) - Controller hash password
 */
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, role, fullName, phone, gender, dob } = req.body;

    // Validate input
    if (!username || !password || !role)
      return res.status(400).json({ success: false, message: 'Thiếu username, password hoặc role' });

    // Hash password trước khi gửi cho Model
    const saltRounds = 10; // Nên đặt trong config
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
        username,
        password: hashedPassword, // Gửi password đã hash
        email,
        role,
        fullName,
        phone,
        gender,
        dob
    };

    const [newUserId] = await userModel.create(userData);

    res.status(201).json({ success: true, message: 'Thêm người dùng thành công', id: newUserId });
  } catch (err) {
    console.error('❌ Lỗi createUser:', err);
    if (err.message.includes('là bắt buộc')) { // Lỗi validation từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'ER_DUP_ENTRY') { // Lỗi trùng username/email
       return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm người dùng' });
  }
};

/**
 * ✏️ Cập nhật người dùng
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy các trường có thể cập nhật từ body (không bao gồm password)
    const { username, email, role, fullName, phone, gender, dob, isActive } = req.body;
    const userData = { username, email, role, fullName, phone, gender, dob, isActive };

    const updated = await userModel.update(id, userData);

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để cập nhật' });

    res.json({ success: true, message: 'Cập nhật người dùng thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateUser:', err);
     if (err.code === 'ER_DUP_ENTRY') { // Lỗi trùng username/email khi update
       return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật người dùng' });
  }
};

/**
 * 🚫 Khóa/Mở khóa tài khoản người dùng (Soft delete/undelete)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Mặc định là khóa (isActive = false)
    // Có thể thêm logic để mở khóa nếu cần (vd: gửi query param ?action=activate)
    const isActive = false;

    const updated = await userModel.setActiveStatus(id, isActive);

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    // TODO: Đồng bộ status/deletedAt của HocVien/GiaoVien tương ứng (có thể làm trong Model hoặc Service Layer)
    // Ví dụ: if (user.role === 'HOCVIEN') await studentModel.setActiveStatus(id, isActive);

    res.json({ success: true, message: isActive ? 'Đã mở khóa tài khoản người dùng' : 'Đã khóa tài khoản người dùng' });
  } catch (err) {
    console.error('❌ Lỗi deleteUser:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi khóa/mở khóa người dùng' });
  }
};