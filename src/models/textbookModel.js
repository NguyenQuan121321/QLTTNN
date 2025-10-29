const db = require('../config/database'); //

/**
 * 📋 Lấy tất cả giáo trình (Join với Môn học)
 */
const findAll = () => {
  return db('GiaoTrinh') //
    .leftJoin('MonHoc', 'GiaoTrinh.monHocId', 'MonHoc.maMonHoc') //
    .select('GiaoTrinh.*', 'MonHoc.tenMonHoc');
};

/**
 * 🔍 Lấy giáo trình theo ID
 */
const findById = (id) => {
  return db('GiaoTrinh').where('id', id).first(); //
};

/**
 * ➕ Tạo mới giáo trình
 */
const create = (textbookData) => {
  const { monHocId, tenGiaoTrinh, tacGia, namXB, moTa } = textbookData;
   if (!monHocId || !tenGiaoTrinh) {
       throw new Error('Mã môn học và Tên giáo trình là bắt buộc.');
   }
  return db('GiaoTrinh').insert({ monHocId, tenGiaoTrinh, tacGia, namXB, moTa }); //
};

/**
 * ✏️ Cập nhật giáo trình
 */
const update = (id, textbookData) => {
  const { monHocId, tenGiaoTrinh, tacGia, namXB, moTa } = textbookData;
  const updateData = {};
  if (monHocId) updateData.monHocId = monHocId;
  if (tenGiaoTrinh) updateData.tenGiaoTrinh = tenGiaoTrinh;
  if (tacGia !== undefined) updateData.tacGia = tacGia;
  if (namXB) updateData.namXB = namXB;
  if (moTa !== undefined) updateData.moTa = moTa;

  return db('GiaoTrinh').where('id', id).update(updateData); //
};

/**
 * 🗑️ Xóa giáo trình
 */
const remove = (id) => {
  // Giáo trình thường không có ràng buộc phức tạp, có thể xóa trực tiếp
  return db('GiaoTrinh').where('id', id).del(); //
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};