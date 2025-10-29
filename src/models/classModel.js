const db = require('../config/database'); //

/**
 * 📋 Lấy danh sách lớp học (hỗ trợ lọc theo Môn học)
 */
const findAll = (queryParams) => {
  const query = db('LopHoc')
    .leftJoin('GiaoVien', 'LopHoc.giaoVienId', 'GiaoVien.id') //
    .leftJoin('MonHoc', 'LopHoc.monHocId', 'MonHoc.maMonHoc') //
    .leftJoin('PhongHoc', 'LopHoc.phongHocId', 'PhongHoc.maPhong') //
    .select(
      'LopHoc.id',
      'LopHoc.maLop',
      'LopHoc.tenLop',
      'LopHoc.trangThai',
      'LopHoc.ngayBatDau',
      'MonHoc.tenMonHoc',
      'PhongHoc.tenPhong'
      // Thêm 'GiaoVien.maGV' hoặc 'User.fullName' nếu FE cần
    );
  
  // (MỚI) Hỗ trợ lọc theo Môn học (ví dụ: /api/classes?monHocId=TOEIC_550)
  if (queryParams && queryParams.monHocId) {
    query.where('LopHoc.monHocId', queryParams.monHocId);
  }

  return query;
};

/**
 * 🔍 (NÂNG CẤP) Lấy chi tiết lớp (Kèm DSHV và Tình trạng học phí)
 */
const findById = async (id) => {
  
  // 1. Lấy thông tin cơ bản của Lớp
  const classInfoPromise = db('LopHoc')
    .leftJoin('GiaoVien', 'LopHoc.giaoVienId', 'GiaoVien.id')
    .leftJoin('MonHoc', 'LopHoc.monHocId', 'MonHoc.maMonHoc')
    .leftJoin('PhongHoc', 'LopHoc.phongHocId', 'PhongHoc.maPhong')
    .leftJoin('User', 'GiaoVien.id', 'User.id') // Join thêm User để lấy tên GV
    .select(
      'LopHoc.*',
      'MonHoc.tenMonHoc',
      'PhongHoc.tenPhong',
      // Lấy thông tin GV từ cả 2 bảng
      db.raw("JSON_OBJECT('id', GiaoVien.id, 'fullName', User.fullName, 'maGV', GiaoVien.maGV) as teacherInfo") 
    )
    .where('LopHoc.id', id)
    .first();

  // 2. (MỚI) Lấy danh sách sinh viên và tình trạng học phí của họ CHO LỚP NÀY
  const studentsPromise = db('Enrollment') //
    .join('HocVien', 'Enrollment.hocVienId', 'HocVien.id') //
    .join('User', 'HocVien.id', 'User.id') //
    // Dùng Left Join để nếu SV chưa có phiếu thu thì vẫn hiện ra
    .leftJoin('HocPhi', (builder) => { //
      builder.on('HocPhi.hocVienId', '=', 'HocVien.id')
             .andOn('HocPhi.lopHocId', '=', 'Enrollment.lopHocId'); // Quan trọng: Phải khớp cả lopHocId
    })
    .where('Enrollment.lopHocId', id)
    .select(
      'HocVien.id as studentId',
      'HocVien.code as studentCode',
      'User.fullName as studentName',
      'User.email',
      'User.phone',
      'Enrollment.status as enrollmentStatus',
      // (MỚI) Trạng thái học phí cho lớp này
      db.raw("IF(HocPhi.id IS NULL, 'Chưa tạo phí', HocPhi.trangThai) as feeStatus"),
      'HocPhi.soTien'
    );

  const [classInfo, students] = await Promise.all([classInfoPromise, studentsPromise]);

  if (!classInfo) return null;

  return {
    ...classInfo,
    students: students // Gắn danh sách sinh viên vào kết quả
  };
};

/**
 * ➕ Tạo lớp học
 */
const create = (classData) => {
  const { maLop, tenLop, siSoToiDa, ngayBatDau, ngayKetThuc, monHocId, phongHocId, giaoVienId } = classData;

  if (siSoToiDa > 50) {
    throw new Error('Sĩ số tối đa không được vượt quá 50');
  }

  return db('LopHoc').insert({
    maLop,
    tenLop,
    siSoToiDa,
    ngayBatDau,
    ngayKetThuc,
    trangThai: 'Mo', // Mặc định khi tạo
    monHocId,
    phongHocId,
    giaoVienId
  });
};

/**
 * ✏️ Cập nhật lớp học
 */
const update = (id, classData) => {
   // Lấy các trường có thể cập nhật từ controller cũ
   const { tenLop, siSoToiDa, ngayKetThuc, trangThai, giaoVienId } = classData; 

   if (siSoToiDa && siSoToiDa > 50) {
     throw new Error('Sĩ số tối đa không được vượt quá 50');
   }
   
   // (MỚI) Tạo object update động để tránh lỗi
   const updateData = {};
   if (tenLop) updateData.tenLop = tenLop;
   if (siSoToiDa) updateData.siSoToiDa = siSoToiDa;
   if (ngayKetThuc) updateData.ngayKetThuc = ngayKetThuc;
   if (trangThai) updateData.trangThai = trangThai;
   if (giaoVienId) updateData.giaoVienId = giaoVienId; // Cho phép đổi GV

   return db('LopHoc').where({ id }).update(updateData);
};

/**
 * 🚫 Đóng (Xóa mềm) lớp học
 */
const remove = (id) => {
  return db('LopHoc').where({ id }).update({ trangThai: 'Dong' }); //
};


module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};