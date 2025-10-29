const db = require('../config/database'); //

/**
 * 🧑‍💼 Lấy danh sách người dùng (chỉ các trường cần thiết cho list)
 */
const findAll = () => {
  return db('User') //
    .select('id', 'username', 'email', 'role', 'fullName', 'isActive') // Thêm fullName, isActive
    .where('deletedAt', null); // Chỉ lấy user chưa bị xóa mềm (nếu dùng deletedAt)
};

/**
 * 🔍 Lấy thông tin chi tiết người dùng theo ID
 */
const findById = (id) => {
  return db('User').where({ id }).where('deletedAt', null).first(); //
};

/**
 * 🔍 Lấy thông tin người dùng theo username (dùng cho login)
 */
const findByUsername = (username) => {
    return db('User').where({ username }).where('deletedAt', null).first(); //
}

/**
 * ➕ Tạo mới người dùng
 */
const create = (userData) => {
  // Model chỉ nhận dữ liệu đã được xử lý (vd: password đã hash)
  const { username, password, email, role, fullName, phone, gender, dob } = userData;

  if (!username || !password || !role) {
    throw new Error('Username, password, và role là bắt buộc.');
  }

  return db('User').insert({ //
    username,
    password, // Password đã được hash ở controller
    email,
    role: role || 'HOCVIEN', // Mặc định là HOCVIEN nếu không cung cấp
    fullName,
    phone,
    gender,
    dob,
    isActive: true // Mặc định là active khi tạo
    // createdAt, updatedAt sẽ tự động bởi DB nếu đã cấu hình
  });
};

/**
 * ✏️ Cập nhật người dùng
 */
const update = (id, userData) => {
  // Không cho phép cập nhật password ở đây (nên có API riêng)
  const { username, email, role, fullName, phone, gender, dob, isActive } = userData;

  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;
  if (gender) updateData.gender = gender;
  if (dob) updateData.dob = dob;
  if (isActive !== undefined) updateData.isActive = isActive; // Cho phép cập nhật isActive

  return db('User').where({ id }).update(updateData); //
};

/**
 * 🚫 Khóa/Mở khóa người dùng (Soft delete/undelete)
 */
const setActiveStatus = (id, isActive) => {
  // Cần đồng bộ với status của HocVien/GiaoVien nếu có
  const updateData = { isActive };
  if (!isActive) {
      // Nếu dùng cột deletedAt
      // updateData.deletedAt = new Date();
  } else {
      // updateData.deletedAt = null; // Mở khóa
  }
  return db('User').where({ id }).update(updateData); //
};

/**
 * 🔑 Cập nhật mật khẩu (Dùng cho changePassword, resetPassword)
 */
const updatePassword = (id, hashedPassword) => {
    return db('User').where({ id }).update({ password: hashedPassword }); //
}

/**
 * 🔢 Cập nhật số lần đăng nhập sai và trạng thái active
 */
const updateFailedLogin = (id, attempts, isActive) => {
    return db('User').where({ id }).update({ //
        failedLoginAttempts: attempts,
        isActive: isActive
    });
}

/**
 * ✨ Reset số lần đăng nhập sai
 */
const resetFailedLogin = (id) => {
    return db('User').where({ id }).update({ failedLoginAttempts: 0 }); //
}

module.exports = {
  findAll,
  findById,
  findByUsername, // Thêm hàm này
  create,
  update,
  setActiveStatus, // Thay cho delete
  updatePassword, // Thêm hàm này
  updateFailedLogin, // Thêm hàm này
  resetFailedLogin // Thêm hàm này
};