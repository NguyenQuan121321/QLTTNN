const db = require('../config/database'); //

/**
 * ➕ Ghi danh học viên vào lớp
 */
const create = (enrollmentData) => {
  const { hocVienId, lopHocId, status } = enrollmentData;
  if (!hocVienId || !lopHocId) {
    throw new Error('Thiếu ID học viên hoặc ID lớp học.');
  }
  // enrolledAt tự động, status mặc định là 'active'
  return db('Enrollment').insert({
    hocVienId,
    lopHocId,
    status: status || 'active'
  });
};

/**
 * 🔍 Kiểm tra xem học viên đã ghi danh vào lớp chưa
 */
const findExisting = (hocVienId, lopHocId) => {
    return db('Enrollment')
        .where({ hocVienId, lopHocId })
        .first();
};

/**
 * 📋 Lấy danh sách ghi danh (có thể lọc theo lớp hoặc học viên)
 */
const findAll = (filters = {}) => {
  const query = db('Enrollment')
    .join('HocVien', 'Enrollment.hocVienId', 'HocVien.id') //
    .join('User', 'HocVien.id', 'User.id') //
    .join('LopHoc', 'Enrollment.lopHocId', 'LopHoc.id') //
    .select(
      'Enrollment.id',
      'Enrollment.enrolledAt',
      'Enrollment.status',
      'HocVien.id as studentId',
      'HocVien.code as studentCode',
      'User.fullName as studentName',
      'LopHoc.id as classId',
      'LopHoc.maLop as classCode',
      'LopHoc.tenLop as className'
    );

  if (filters.studentId) {
    query.where('Enrollment.hocVienId', filters.studentId);
  }
  if (filters.classId) {
    query.where('Enrollment.lopHocId', filters.classId);
  }
  // Thêm các filter khác nếu cần (ví dụ: status)

  return query.orderBy('Enrollment.enrolledAt', 'desc');
};

/**
 * 🔍 Lấy chi tiết một lượt ghi danh theo ID
 */
const findById = (id) => {
  return db('Enrollment')
    .join('HocVien', 'Enrollment.hocVienId', 'HocVien.id')
    .join('User', 'HocVien.id', 'User.id')
    .join('LopHoc', 'Enrollment.lopHocId', 'LopHoc.id')
    .where('Enrollment.id', id)
    .select(
      'Enrollment.*', // Lấy hết cột của Enrollment
      'HocVien.code as studentCode',
      'User.fullName as studentName',
      'LopHoc.maLop as classCode',
      'LopHoc.tenLop as className'
    )
    .first();
};

/**
 * 🔄 Cập nhật trạng thái ghi danh (vd: rút lui, hoàn thành)
 */
const updateStatus = (id, status) => {
  const validStatus = ['active', 'withdrawn', 'completed']; //
  if (!validStatus.includes(status)) {
    throw new Error(`Trạng thái không hợp lệ: ${status}`);
  }

  const updateData = { status };
  const now = new Date();
  if (status === 'completed') {
    updateData.completedAt = now; // Ghi nhận ngày hoàn thành (nếu dùng DB mới)
  } else if (status === 'withdrawn') {
    updateData.withdrawnAt = now; // Ghi nhận ngày rút lui (nếu dùng DB mới)
  }

  return db('Enrollment').where({ id }).update(updateData);
};

/**
 * 🗑️ Xóa một lượt ghi danh (Hủy ghi danh) - Cân nhắc dùng updateStatus thay thế
 */
const remove = (id) => {
  // Cảnh báo: Xóa cứng sẽ mất dấu vết. Nên dùng updateStatus('withdrawn') hơn.
  // Nếu vẫn muốn xóa:
  return db('Enrollment').where({ id }).del();
};

module.exports = {
  create,
  findExisting,
  findAll,
  findById,
  updateStatus,
  remove
};