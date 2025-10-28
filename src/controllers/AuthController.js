const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwtUtils');
require('dotenv').config();

/**
 * Đăng nhập hệ thống
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db('User').where({ username }).first();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      // tăng số lần nhập sai
      const failed = (user.failedLoginAttempts || 0) + 1;
      await db('User').where({ id: user.id }).update({
        failedLoginAttempts: failed,
        isActive: failed >= 5 ? false : user.isActive
      });

      return res.status(401).json({
        success: false,
        message: failed >= 5
          ? 'Nhập sai 5 lần, tài khoản đã bị khóa'
          : `Sai mật khẩu (${failed}/5)`
      });
    }

    // reset đếm sai
    await db('User').where({ id: user.id }).update({ failedLoginAttempts: 0 });

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      role: user.role,
      username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Đăng xuất (client chỉ cần xóa token)
 */
exports.logout = async (req, res) => {
  return res.json({ success: true, message: 'Đã đăng xuất' });
};

/**
 * Đổi mật khẩu
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // từ middleware
    const { oldPassword, newPassword } = req.body;

    const user = await db('User').where({ id: userId }).first();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db('User').where({ id: userId }).update({ password: hashed });

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Quên mật khẩu (gửi email reset link)
 * ⚠️ Bản demo — thực tế cần gửi qua emailService
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db('User').where({ email }).first();
    if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại' });

    const resetToken = generateToken({ id: user.id }, '15m'); // hết hạn sau 15 phút
    // TODO: gửi email chứa link reset kèm token

    res.json({
      success: true,
      message: 'Đã gửi liên kết đặt lại mật khẩu (demo)',
      token: resetToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Đặt lại mật khẩu bằng token
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);
    await db('User').where({ id: decoded.id }).update({ password: hashed });
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};