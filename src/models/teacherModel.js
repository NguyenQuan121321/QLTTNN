const db = require('../config/database'); //

/**
 * 📋 Lấy danh sách giáo viên (Join với User)
 */
const findAll = () => {
  return db('GiaoVien') //
    .join('User', 'GiaoVien.id', '=', 'User.id') //
    .select(
      'GiaoVien.id', // User ID
      'User.fullName',
      'User.email',
      'User.phone',
      'GiaoVien.maGV',
      'GiaoVien.chuyenMon',
      'GiaoVien.status',
      'GiaoVien.joinedDate'
      // Thêm các trường khác từ GiaoVien nếu cần (address, degree...)
    )
    .where('GiaoVien.deletedAt', null) // Chỉ lấy GV chưa bị xóa mềm
    .where('User.deletedAt', null);      // Chỉ lấy User chưa bị xóa mềm
};

/**
 * 🔍 Lấy thông tin chi tiết giáo viên (Join với User)
 */
const findById = (id) => {
  return db('GiaoVien') //
    .join('User', 'GiaoVien.id', '=', 'User.id') //
    .where('GiaoVien.id', id)
    .where('GiaoVien.deletedAt', null) // Đảm bảo GV chưa bị xóa
    .where('User.deletedAt', null)      // Đảm bảo User chưa bị xóa
    .select('GiaoVien.*', 'User.username', 'User.fullName', 'User.email', 'User.phone', 'User.gender', 'User.dob', 'User.isActive') // Lấy tất cả thông tin
    .first();
};

/**
 * ➕ Tạo mới giáo viên (Tạo User và GiaoVien)
 */
const create = (teacherData) => {
  const { username, password, fullName, email, phone, chuyenMon, degree, address, joinedDate, avatar } = teacherData;

   if (!username || !password) {
       throw new Error('Username và Password là bắt buộc.');
   }
   // Thêm các validation khác nếu cần

  return db.transaction(async (trx) => {
    // 1. Tạo User
    const [userId] = await trx('User').insert({
      username,
      password, // TODO: Hash mật khẩu ở Controller hoặc Service Layer
      role: 'GIAOVIEN',
      fullName,
      email,
      phone
      // Thêm gender, dob nếu có từ FE
    });

    // 2. Tạo GiaoVien
    await trx('GiaoVien').insert({
      id: userId,
      maGV: `GV${Date.now().toString().slice(-6)}`, // Cải thiện mã GV
      address,
      degree,
      joinedDate: joinedDate || new Date(),
      avatar,
      chuyenMon,
      status: 'active' // Mặc định
    });

    return { id: userId }; // Trả về ID của User (cũng là ID của GiaoVien)
  });
};

/**
 * ✏️ Cập nhật thông tin giáo viên (Cả User và GiaoVien)
 */
const update = (id, teacherData) => {
  const { fullName, email, phone, chuyenMon, degree, status, address, avatar } = teacherData;
  // Thêm gender, dob nếu cần cập nhật User

   const validStatus = ['active', 'inactive'];
   const newStatus = validStatus.includes(status) ? status : 'active';
   const isActiveUser = (newStatus === 'active'); // User active khi GiaoVien active

  return db.transaction(async (trx) => {
    // 1. Cập nhật User
    const userDataToUpdate = {};
    if (fullName) userDataToUpdate.fullName = fullName;
    if (email) userDataToUpdate.email = email;
    if (phone) userDataToUpdate.phone = phone;
    // Thêm gender, dob
    userDataToUpdate.isActive = isActiveUser; // Đồng bộ User.isActive

    await trx('User').where({ id }).update(userDataToUpdate);

    // 2. Cập nhật GiaoVien
    const teacherDataToUpdate = {};
    if (chuyenMon) teacherDataToUpdate.chuyenMon = chuyenMon;
    if (degree) teacherDataToUpdate.degree = degree;
    if (status) teacherDataToUpdate.status = newStatus;
    if (address !== undefined) teacherDataToUpdate.address = address;
    if (avatar !== undefined) teacherDataToUpdate.avatar = avatar;

    await trx('GiaoVien').where({ id }).update(teacherDataToUpdate);
  });
};

/**
 * 🚫 Khóa giáo viên (Soft delete)
 */
const remove = (id) => {
  const now = new Date();
  return db.transaction(async (trx) => {
    // Cập nhật GiaoVien
    await trx('GiaoVien').where({ id }).update({
        status: 'inactive',
        deletedAt: now // Đánh dấu xóa mềm
    });
    // Cập nhật User
    await trx('User').where({ id }).update({
        isActive: false,
        deletedAt: now // Đánh dấu xóa mềm
    });
    // (Quan trọng) Xử lý các lớp đang được GV này dạy
    // Option 1: Gán lớp cho GV khác (phức tạp)
    // Option 2: Set giaoVienId của các lớp đó thành NULL (nếu CSDL cho phép)
    await trx('LopHoc').where('giaoVienId', id).update({ giaoVienId: null });
  });
};


module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};