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
      'GiaoVien.status', // Lọc theo status này nếu cần
      'GiaoVien.joinedDate'
    )
    // .where('GiaoVien.deletedAt', null) // XÓA DÒNG NÀY
    // .where('User.deletedAt', null);      // XÓA DÒNG NÀY
    // Thay vào đó, nếu muốn chỉ lấy GV active, dùng:
    .where('GiaoVien.status', 'active') //
    .where('User.isActive', true); //
};

/**
 * 🔍 Lấy thông tin chi tiết giáo viên (Join với User)
 */
const findById = (id) => {
  return db('GiaoVien') //
    .join('User', 'GiaoVien.id', '=', 'User.id') //
    .where('GiaoVien.id', id)
    // .where('GiaoVien.deletedAt', null) // XÓA DÒNG NÀY
    // .where('User.deletedAt', null)      // XÓA DÒNG NÀY
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
      role: 'GIAOVIEN', //
      fullName,
      email,
      phone,
      isActive: true // Mặc định active
    });

    // 2. Tạo GiaoVien
    await trx('GiaoVien').insert({ //
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

   const validStatus = ['active', 'inactive']; //
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

    await trx('User').where({ id }).update(userDataToUpdate); //

    // 2. Cập nhật GiaoVien
    const teacherDataToUpdate = {};
    if (chuyenMon) teacherDataToUpdate.chuyenMon = chuyenMon;
    if (degree) teacherDataToUpdate.degree = degree;
    if (status) teacherDataToUpdate.status = newStatus;
    if (address !== undefined) teacherDataToUpdate.address = address;
    if (avatar !== undefined) teacherDataToUpdate.avatar = avatar;

    await trx('GiaoVien').where({ id }).update(teacherDataToUpdate); //
  });
};

/**
 * 🚫 Khóa giáo viên (Cập nhật status và isActive)
 */
const remove = (id) => {
  // const now = new Date(); // Không cần nếu không dùng deletedAt
  return db.transaction(async (trx) => {
    // Cập nhật GiaoVien
    await trx('GiaoVien').where({ id }).update({ //
        status: 'inactive',
        // deletedAt: now // KHÔNG DÙNG
    });
    // Cập nhật User
    await trx('User').where({ id }).update({ //
        isActive: false,
        // deletedAt: now // KHÔNG DÙNG
    });
    // (QUAN TRỌNG) Set giaoVienId của các lớp đang dạy thành NULL
    await trx('LopHoc').where('giaoVienId', id).update({ giaoVienId: null }); //
  });
};


module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};