const db = require('../config/database'); //

/**
 * ✍️ Ghi nhận một lượt điểm danh
 */
const create = (attendanceData) => {
  const { lopHocId, hocVienId, ngayHoc, coMat, coPhep, ghiChu, giaoVienId } = attendanceData;

  // TODO: Thêm kiểm tra tránh duplicate điểm danh trong cùng ngày/lớp/học viên
  // const existing = await db('DiemDanh').where({ lopHocId, hocVienId, ngayHoc }).first();
  // if (existing) {
  //   throw new Error('Học viên đã được điểm danh hôm nay rồi.');
  // }

  return db('DiemDanh').insert({ //
    lopHocId,
    hocVienId,
    ngayHoc: ngayHoc || new Date(), // Mặc định là ngày hiện tại nếu không cung cấp
    coMat: coMat || false, // Mặc định là vắng
    coPhep: coPhep || false, // Mặc định là không phép
    ghiChu,
    giaoVienId
  });
};

/**
 * 📊 Lấy lịch sử điểm danh của một lớp học
 */
const findByClass = (lopHocId) => {
  return db('DiemDanh') //
    .join('User', 'DiemDanh.hocVienId', 'User.id') // Join để lấy tên học viên
    .join('HocVien', 'DiemDanh.hocVienId', 'HocVien.id') // Join để lấy mã học viên
    .leftJoin('User as TeacherUser', 'DiemDanh.giaoVienId', 'TeacherUser.id') // Join để lấy tên GV điểm danh (dùng alias)
    .where('DiemDanh.lopHocId', lopHocId)
    .select(
        'DiemDanh.id',
        'DiemDanh.ngayHoc',
        'DiemDanh.coMat',
        'DiemDanh.coPhep',
        'DiemDanh.ghiChu',
        'HocVien.code as studentCode',
        'User.fullName as studentName',
        'TeacherUser.fullName as teacherName' // Lấy tên GV
        )
    .orderBy('DiemDanh.ngayHoc', 'desc') // Sắp xếp theo ngày gần nhất
    .orderBy('User.fullName', 'asc'); // Rồi theo tên học viên
};

/**
 * 🔢 Đếm số buổi nghỉ không phép của một học viên trong một lớp
 */
const countUnexcusedAbsences = (lopHocId, hocVienId) => {
  return db('DiemDanh') //
    .where({
      lopHocId,
      hocVienId,
      coMat: false,
      coPhep: false // Chỉ đếm nghỉ không phép
    })
    .count('id as totalAbsences')
    .first();
};

module.exports = {
  create,
  findByClass,
  countUnexcusedAbsences
};