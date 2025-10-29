const db = require('../config/database'); //

/**
 * 📋 Lấy danh sách kỳ thi (có thể lọc theo lớp)
 */
const findAll = (queryParams) => {
  const query = db('Exam') //
    .leftJoin('LopHoc', 'Exam.lopHocId', 'LopHoc.id') //
    .select(
        'Exam.id',
        'Exam.tenKyThi',
        'Exam.ngayThi',
        'LopHoc.tenLop',
        'LopHoc.maLop' // Thêm mã lớp nếu cần
        );

  // Lọc theo lopHocId nếu có query param
  if (queryParams && queryParams.lopHocId) {
    query.where('Exam.lopHocId', queryParams.lopHocId);
  }

  return query;
};

/**
 * 🔍 Lấy chi tiết kỳ thi (kèm kết quả nếu có)
 */
const findById = async (id) => {
    // 1. Lấy thông tin kỳ thi
    const examPromise = db('Exam')
        .leftJoin('LopHoc', 'Exam.lopHocId', 'LopHoc.id')
        .select('Exam.*', 'LopHoc.tenLop', 'LopHoc.maLop')
        .where('Exam.id', id)
        .first();

    // 2. Lấy kết quả thi của kỳ thi này
    const resultsPromise = db('ExamResult') //
        .join('HocVien', 'ExamResult.hocVienId', 'HocVien.id') //
        .join('User', 'HocVien.id', 'User.id') //
        .where('ExamResult.examId', id)
        .select(
            'ExamResult.id as resultId',
            'ExamResult.diem',
            'HocVien.id as studentId',
            'HocVien.code as studentCode',
            'User.fullName as studentName'
        );

    const [exam, results] = await Promise.all([examPromise, resultsPromise]);

    if (!exam) return null;

    return {
        ...exam,
        results: results // Gắn danh sách kết quả vào
    };
};

/**
 * ➕ Tạo mới kỳ thi
 */
const create = (examData) => {
  const { lopHocId, tenKyThi, ngayThi } = examData;

  if (!tenKyThi || !ngayThi) {
      throw new Error('Thiếu tên kỳ thi hoặc ngày thi');
  }
  
  // (Optional but recommended) Check if lopHocId exists before inserting
  // This check can also be done in the controller
  
  // if (lopHocId) {
  //   const lopExists = await db('LopHoc').where({ id: lopHocId }).first();
  //   if (!lopExists) {
  //      throw new Error(`Lớp học với ID ${lopHocId} không tồn tại`);
  //   }
  // }

  return db('Exam').insert({
    lopHocId, // Can be null if it's a general exam
    tenKyThi,
    ngayThi
  });
};

/**
 * ✏️ Cập nhật kỳ thi
 */
const update = (id, examData) => {
  const { lopHocId, tenKyThi, ngayThi } = examData;
   // Create update object dynamically to avoid errors if fields are missing
   const updateData = {};
   if (lopHocId !== undefined) updateData.lopHocId = lopHocId; // Allow setting to null maybe?
   if (tenKyThi) updateData.tenKyThi = tenKyThi;
   if (ngayThi) updateData.ngayThi = ngayThi;

  return db('Exam').where({ id }).update(updateData);
};

/**
 * 🗑️ Xóa kỳ thi
 */
const remove = (id) => {
  // Note: Depending on ON DELETE constraints, deleting an Exam might cascade delete ExamResult
  return db('Exam').where({ id }).del();
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};