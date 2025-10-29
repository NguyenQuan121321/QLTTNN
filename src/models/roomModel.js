const db = require('../config/database'); //

/**
 * 📋 Lấy tất cả phòng học
 */
const findAll = () => {
  return db('PhongHoc').select('*'); //
};

/**
 * 🔍 Lấy phòng học theo mã phòng (maPhong)
 */
const findById = (maPhong) => {
  return db('PhongHoc').where('maPhong', maPhong).first(); //
};

/**
 * ➕ Tạo mới phòng học
 */
const create = (roomData) => {
  const { maPhong, tenPhong, sucChua, moTa } = roomData;
  // Có thể thêm validation ở đây nếu cần
  return db('PhongHoc').insert({ maPhong, tenPhong, sucChua, moTa }); //
};

/**
 * ✏️ Cập nhật phòng học
 */
const update = (maPhong, roomData) => {
  const { tenPhong, sucChua, moTa } = roomData;
  // Tạo object update động
  const updateData = {};
  if (tenPhong) updateData.tenPhong = tenPhong;
  if (sucChua) updateData.sucChua = sucChua;
  if (moTa !== undefined) updateData.moTa = moTa; // Cho phép cập nhật mô tả thành rỗng

  return db('PhongHoc').where('maPhong', maPhong).update(updateData); //
};

/**
 * 🗑️ Xóa phòng học
 */
const remove = async (maPhong) => {
   // (MỚI) Kiểm tra ràng buộc khóa ngoại trước khi xóa
   const lopUsingRoom = await db('LopHoc').where('phongHocId', maPhong).first(); //
   if (lopUsingRoom) {
       throw new Error(`Không thể xóa phòng '${maPhong}' vì đang được sử dụng bởi lớp '${lopUsingRoom.tenLop}' (ID: ${lopUsingRoom.id}).`);
   }
   return db('PhongHoc').where('maPhong', maPhong).del(); //
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};