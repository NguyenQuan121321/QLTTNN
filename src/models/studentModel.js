const db = require('../config/database'); //

/**
 * 📋 Lấy danh sách tất cả học viên (Đơn giản)
 */
const findAll = () => {
  return db('HocVien')
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
};

/**
 * 🔍 Lấy chi tiết học viên (Bao gồm lớp học và học phí)
 */
const findById = async (id) => {
  // 1. Lấy thông tin cơ bản
  const studentPromise = db('HocVien')
    .join('User', 'HocVien.id', '=', 'User.id')
    .where('HocVien.id', id)
    .select('HocVien.*', 'User.fullName', 'User.email', 'User.phone', 'User.dob', 'User.gender')
    .first();

  // 2. Lấy danh sách lớp (từ bảng Enrollment)
  const classesPromise = db('Enrollment')
    .join('LopHoc', 'Enrollment.lopHocId', 'LopHoc.id')
    .where('Enrollment.hocVienId', id)
    .select('LopHoc.tenLop', 'LopHoc.maLop', 'Enrollment.status as enrollmentStatus');
    
  // 3. Lấy lịch sử học phí (từ bảng HocPhi)
  const feesPromise = db('HocPhi')
    .leftJoin('LopHoc', 'HocPhi.lopHocId', 'LopHoc.id')
    .where('HocPhi.hocVienId', id)
    .select('HocPhi.id as feeId', 'HocPhi.soTien', 'HocPhi.hanDong', 'HocPhi.trangThai as feeStatus', 'LopHoc.tenLop');

  const [student, classes, fees] = await Promise.all([
    studentPromise,
    classesPromise,
    feesPromise
  ]);

  if (!student) return null;

  // 4. Gộp dữ liệu
  return {
    ...student,
    enrolledClasses: classes,
    tuitionHistory: fees
  };
};

/**
 * ➕ Tạo mới học viên
 */
const create = async (studentData) => {
  const { username, password, fullName, email, phone, address, guardianName, guardianPhone } = studentData;

  const loginName = username || email;
  if (!loginName || !password) {
    throw new Error('Thiếu Tên đăng nhập (username/email) hoặc Mật khẩu');
  }

  // Dùng transaction để đảm bảo cả 2 bảng cùng được tạo
  return db.transaction(async (trx) => {
    // 1. Tạo User
    const [userId] = await trx('User').insert({
      username: loginName,
      password, // TODO: Hash mật khẩu này ở Controller hoặc Service Layer
      role: 'HOCVIEN',
      fullName,
      email,
      phone
    });

    // 2. Tạo HocVien
    const [hocVienId] = await trx('HocVien').insert({
      id: userId,
      code: `HV${Date.now().toString().slice(-6)}`,
      address,
      registrationDate: new Date(),
      status: 'active',
      guardianName,
      guardianPhone
    });
    
    return { id: hocVienId };
  });
};

/**
 * ✏️ Cập nhật học viên
 */
const update = (id, studentData) => {
  const { fullName, email, phone, address, status } = studentData;

  const validStatus = ['active', 'inactive', 'suspended', 'graduated'];
  const newStatus = validStatus.includes(status) ? status : 'active';
  const isActive = (newStatus === 'active' || newStatus === 'graduated');

  return db.transaction(async (trx) => {
    // 1. Cập nhật User
    await trx('User').where({ id }).update({ 
      fullName, 
      email, 
      phone,
      isActive: isActive // Đồng bộ User.isActive
    });
    
    // 2. Cập nhật HocVien
    await trx('HocVien').where({ id }).update({ 
      address, 
      status: newStatus 
    });
  });
};

/**
 * 🚫 Khóa học viên (Giống hàm delete)
 */
const remove = (id) => {
  // Thay vì xóa, chúng ta cập nhật trạng thái
  return db.transaction(async (trx) => {
    await trx('HocVien').where({ id }).update({ status: 'inactive' });
    await trx('User').where({ id }).update({ isActive: false });
  });
};

// Xuất các hàm này ra để Controller có thể dùng
module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};