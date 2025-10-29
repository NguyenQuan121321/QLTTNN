const db = require('../config/database'); //

/**
 * 📋 Lấy tất cả môn học
 */
const findAll = () => {
  return db("MonHoc").select("*"); //
};

/**
 * 🔍 Lấy môn học theo mã môn học (maMonHoc)
 */
const findById = (maMonHoc) => {
  return db("MonHoc").where("maMonHoc", maMonHoc).first(); //
};

/**
 * ➕ Tạo mới môn học
 */
const create = (subjectData) => {
  const { maMonHoc, tenMonHoc, moTa, heDaoTao } = subjectData;
  // Thêm validation nếu cần (ví dụ: kiểm tra maMonHoc không được rỗng)
  if (!maMonHoc || !tenMonHoc) {
      throw new Error('Mã môn học và Tên môn học là bắt buộc.');
  }
  return db("MonHoc").insert({ maMonHoc, tenMonHoc, moTa, heDaoTao }); //
};

/**
 * ✏️ Cập nhật môn học
 */
const update = (maMonHoc, subjectData) => {
  const { tenMonHoc, moTa, heDaoTao } = subjectData;
  const updateData = {};
  if (tenMonHoc) updateData.tenMonHoc = tenMonHoc;
  if (moTa !== undefined) updateData.moTa = moTa;
  if (heDaoTao) updateData.heDaoTao = heDaoTao;

  return db("MonHoc").where("maMonHoc", maMonHoc).update(updateData); //
};

/**
 * 🗑️ Xóa môn học
 */
const remove = async (maMonHoc) => {
    // (MỚI) Kiểm tra ràng buộc khóa ngoại trước khi xóa
    const classUsingSubject = await db('LopHoc').where('monHocId', maMonHoc).first(); //
    if (classUsingSubject) {
        throw new Error(`Không thể xóa môn học '${maMonHoc}' vì đang được sử dụng bởi lớp '${classUsingSubject.tenLop}' (ID: ${classUsingSubject.id}).`);
    }
    // Tương tự, kiểm tra bảng GiaoTrinh, TaiLieuGiangDay nếu cần
    // const textbookUsingSubject = await db('GiaoTrinh').where('monHocId', maMonHoc).first();
    // if (textbookUsingSubject) { ... }

  return db("MonHoc").where("maMonHoc", maMonHoc).del(); //
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};