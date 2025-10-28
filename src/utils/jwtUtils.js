const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Tạo JWT token
 * @param {*} payload 
 * @param {*} expires (mặc định 1 ngày)
 */
exports.generateToken = (payload, expires = '1d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });
};