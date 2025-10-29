const db = require('../config/database'); //

/**
 * 💸 Tạo phiếu thu học phí mới
 */
const create = (feeData) => {
  const { hocVienId, lopHocId, soTien, hanDong, description } = feeData;
  // Thêm validation nếu cần
  if (!hocVienId || !soTien || !hanDong) {
    throw new Error('Thiếu thông tin học viên, số tiền hoặc hạn đóng.');
  }
  return db('HocPhi').insert({ //
    hocVienId,
    lopHocId, // Có thể null
    soTien,
    // description, // Thêm mô tả nếu DB có cột này
    hanDong,
    trangThai: 'unpaid' // Mặc định
  });
};

/**
 * 🔍 Tìm phiếu thu học phí theo ID
 */
const findById = (id) => {
  return db('HocPhi').where({ id }).first(); //
};

/**
 * 💰 Ghi nhận thanh toán mới
 */
const addPayment = (paymentData) => {
    const { hocPhiId, soTienThanhToan, phuongThuc, ghiChu } = paymentData;
    if (!hocPhiId || !soTienThanhToan) {
        throw new Error('Thiếu ID phiếu thu hoặc số tiền thanh toán.');
    }
    return db('Payments').insert({ //
        hocPhiId,
        soTien: soTienThanhToan,
        phuongThuc,
        ghiChu
    });
};

/**
 * 📊 Tính tổng số tiền đã thanh toán cho một phiếu thu
 */
const getTotalPaid = (hocPhiId) => {
    return db('Payments') //
      .where({ hocPhiId })
      .sum('soTien as totalPaid')
      .first();
};

/**
 * 🔄 Cập nhật trạng thái của phiếu thu học phí
 */
const updateStatus = (hocPhiId, newStatus) => {
    const validStatus = ['unpaid', 'partial', 'paid', 'overdue']; //
    if (!validStatus.includes(newStatus)) {
        throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
    }
    return db('HocPhi').where({ id: hocPhiId }).update({ trangThai: newStatus }); //
};


/**
 * 📅 Cập nhật trạng thái 'overdue' cho các phiếu quá hạn
 */
const markOverdue = () => {
    const today = new Date();
    return db('HocPhi') //
      .where('hanDong', '<', today)
      .andWhere('trangThai', '!=', 'paid') // Chỉ cập nhật nếu chưa trả đủ
      .update({ trangThai: 'overdue' });
};

/**
 * 🆔 Lấy danh sách ID học viên có học phí quá hạn
 */
const findOverdueStudentIds = () => {
    return db('HocPhi') //
      .where({ trangThai: 'overdue' })
      .distinct('hocVienId')
      .pluck('hocVienId'); // Chỉ lấy mảng các ID
};

/**
 * 🔒 Khóa tài khoản học viên (Cập nhật HocVien và User)
 */
const lockStudentAccounts = (studentIds) => {
    if (!studentIds || studentIds.length === 0) {
        return 0; // Không có ai để khóa
    }
    // const now = new Date(); // Dùng cho deletedAt nếu có
    return db.transaction(async (trx) => {
        // Cập nhật HocVien
        await trx('HocVien')
            .whereIn('id', studentIds)
            .update({
                status: 'suspended', // Trạng thái bị khóa do nợ
                // deletedAt: now // Nếu dùng cột deletedAt
            });
        // Cập nhật User
        await trx('User')
            .whereIn('id', studentIds)
            .update({
                isActive: false, // Không cho login
                // deletedAt: now // Nếu dùng cột deletedAt
            });
    });
};

module.exports = {
  create,
  findById,
  addPayment,
  getTotalPaid,
  updateStatus,
  markOverdue,
  findOverdueStudentIds,
  lockStudentAccounts
};