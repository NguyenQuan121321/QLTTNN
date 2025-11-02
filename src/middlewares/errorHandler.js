const errorHandler = (err, req, res, next) => {
  console.error('💥 LỖI TOÀN HỆ THỐNG:', err); // Log lỗi chi tiết ra console server

  // Lấy status code từ lỗi (nếu có), mặc định là 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Lấy message lỗi
  // Ưu tiên message từ lỗi ném ra, nếu không thì dùng message mặc định
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // (Tùy chọn) Xử lý các loại lỗi cụ thể để trả về thông báo thân thiện hơn
  if (err.name === 'ValidationError') { // Ví dụ lỗi từ validator
    statusCode = 400; // Bad Request
    // Lấy thông báo lỗi đầu tiên từ validator (nếu dùng express-validator)
    message = err.errors ? err.errors[0].msg : 'Dữ liệu không hợp lệ';
  } else if (err.code === 'ER_DUP_ENTRY') { // Lỗi trùng lặp từ MySQL
    statusCode = 400;
    message = 'Dữ liệu bị trùng lặp (ví dụ: username hoặc email đã tồn tại).';
  } else if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') { // Lỗi khóa ngoại
      statusCode = 400;
      message = 'Dữ liệu tham chiếu không tồn tại (ví dụ: ID lớp học hoặc ID học viên không đúng).';
  }
  // Thêm các xử lý lỗi khác nếu cần (vd: lỗi JWT, lỗi phân quyền...)

  // Gửi phản hồi lỗi về client
  res.status(statusCode).json({
    success: false,
    message: message,
    // (Tùy chọn) Chỉ gửi stack trace khi ở môi trường development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;