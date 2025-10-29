const db = require('../config/database'); //

/**
 * 📜 Lấy danh sách tất cả chứng chỉ
 */
const findAll = () => {
  return db('ChungChi') //
    .select(
      'id',
      'hocVienId',
      'maChungChi',
      'tenChungChi',
      'ngayCap',
      'nguoiKy',
      'hieuLucDen',
      'filePDF',
      'qrCode',
      'trangThai'
    );
};

/**
 * 🔍 Lấy chi tiết 1 chứng chỉ theo ID
 */
const findById = (id) => {
  return db('ChungChi').where({ id }).first(); //
};

/**
 * 🔍 Tìm chứng chỉ theo học viên và mã chứng chỉ (để kiểm tra trùng lặp)
 */
const findByStudentAndCode = (hocVienId, maChungChi) => {
    return db('ChungChi').where({ hocVienId, maChungChi }).first(); //
}

/**
 * 🔍 Tìm kết quả thi theo học viên và kỳ thi (để kiểm tra điểm)
 */
const findExamResult = (hocVienId, examId) => {
    return db('ExamResult').where({ hocVienId, examId }).first(); //
}

/**
 * ➕ Tạo mới chứng chỉ
 */
const create = (certificateData) => {
  const {
    hocVienId,
    maChungChi,
    tenChungChi,
    ngayCap,
    nguoiKy,
    hieuLucDen,
    filePDF,
    qrCode,
    trangThai
  } = certificateData;

  // Model chỉ insert, việc kiểm tra (học viên tồn tại, điểm thi, trùng lặp) sẽ do Controller làm
  return db('ChungChi').insert({ //
    hocVienId,
    maChungChi,
    tenChungChi,
    ngayCap,
    nguoiKy,
    hieuLucDen,
    filePDF,
    qrCode,
    trangThai: trangThai || 'valid' // Mặc định là 'valid'
  });
};

/**
 * ✏️ Cập nhật chứng chỉ
 */
const update = (id, certificateData) => {
    const {
      hocVienId,
      maChungChi,
      tenChungChi,
      ngayCap,
      nguoiKy,
      hieuLucDen,
      filePDF,
      qrCode,
      trangThai
    } = certificateData;

    // Tạo object update động
    const updateData = {};
    if (hocVienId) updateData.hocVienId = hocVienId;
    if (maChungChi) updateData.maChungChi = maChungChi;
    if (tenChungChi) updateData.tenChungChi = tenChungChi;
    if (ngayCap) updateData.ngayCap = ngayCap;
    if (nguoiKy) updateData.nguoiKy = nguoiKy;
    if (hieuLucDen) updateData.hieuLucDen = hieuLucDen;
    if (filePDF !== undefined) updateData.filePDF = filePDF;
    if (qrCode !== undefined) updateData.qrCode = qrCode;
    if (trangThai) updateData.trangThai = trangThai;


  return db('ChungChi').where({ id }).update(updateData); //
};

/**
 * 🗑️ Vô hiệu hóa chứng chỉ (đổi trạng thái thành 'expired')
 */
const disable = (id) => {
  return db('ChungChi').where({ id }).update({ trangThai: 'expired' }); //
};

module.exports = {
  findAll,
  findById,
  findByStudentAndCode,
  findExamResult, // Xuất hàm tìm kết quả thi
  create,
  update,
  disable // Đổi tên delete thành disable cho rõ nghĩa
};