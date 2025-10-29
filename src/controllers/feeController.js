// (MỚI) Gọi Model
const feeModel = require('../models/feeModel');
// (Optional) Gọi studentModel, classModel nếu cần kiểm tra HV, Lớp tồn tại
// const studentModel = require('../models/studentModel');
// const classModel = require('../models/classModel');

/**
 * 💸 Tạo phiếu thu học phí
 */
exports.createFee = async (req, res) => {
  try {
     // (Optional) Validate hocVienId, lopHocId exists?
     // const { hocVienId, lopHocId } = req.body;
     // const student = await studentModel.findById(hocVienId);
     // if (!student) { return res.status(400).json({ success: false, message: 'Học viên không tồn tại' }); }
     // if (lopHocId) { const lop = await classModel.findById(lopHocId); if(!lop) { return res.status(400).json({ success: false, message: 'Lớp học không tồn tại' }); } }

    await feeModel.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo phiếu thu học phí thành công' });
  } catch (err) {
    console.error('❌ Lỗi createFee:', err);
    if (err.message.includes('Thiếu thông tin')) { // Lỗi validation từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo phiếu thu' });
  }
};

/**
 * 💰 Ghi nhận thanh toán
 */
exports.recordPayment = async (req, res) => {
  try {
    const { hocPhiId, soTienThanhToan, phuongThuc, ghiChu } = req.body;

    // 1. Kiểm tra phiếu thu tồn tại (Dùng Model)
    const hocPhi = await feeModel.findById(hocPhiId);
    if (!hocPhi) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu thu học phí' });
    }

    // 2. Thêm thanh toán (Dùng Model)
    await feeModel.addPayment({ hocPhiId, soTienThanhToan, phuongThuc, ghiChu });

    // 3. Tính lại tổng đã đóng (Dùng Model)
    const result = await feeModel.getTotalPaid(hocPhiId);
    const totalPaid = result.totalPaid || 0;

    // 4. Xác định trạng thái mới
    let newStatus = 'partial';
    if (totalPaid >= hocPhi.soTien) {
      newStatus = 'paid';
    } else if (totalPaid <= 0 && hocPhi.trangThai !== 'overdue') { // Không chuyển về unpaid nếu đã overdue
      newStatus = 'unpaid';
    } else if (hocPhi.trangThai === 'overdue' && totalPaid < hocPhi.soTien) {
      newStatus = 'overdue'; // Vẫn giữ overdue nếu chưa đóng đủ
    }
    // Thêm trường hợp nếu đang partial mà đóng thêm vẫn chưa đủ thì vẫn là partial
    else if (hocPhi.trangThai === 'partial' && totalPaid < hocPhi.soTien) {
        newStatus = 'partial';
    }


    // 5. Cập nhật trạng thái (Dùng Model) - Chỉ update nếu trạng thái thay đổi
    if (newStatus !== hocPhi.trangThai) {
       await feeModel.updateStatus(hocPhiId, newStatus);
    }

    res.json({ success: true, message: `Thanh toán thành công. Tổng đã đóng: ${totalPaid}`, currentStatus: newStatus });

  } catch (err) {
    console.error('❌ Lỗi recordPayment:', err);
     if (err.message.includes('Thiếu ID phiếu thu')) { // Lỗi validation từ Model
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi ghi nhận thanh toán' });
  }
};

/**
 * 🔒 Quét và khóa các tài khoản quá hạn
 */
exports.checkAndLockOverdueAccounts = async (req, res) => {
  try {
    // 1. Đánh dấu các phiếu quá hạn (Dùng Model)
    await feeModel.markOverdue();

    // 2. Lấy ID học viên quá hạn (Dùng Model)
    const studentIdsToLock = await feeModel.findOverdueStudentIds();

    if (studentIdsToLock.length === 0) {
      return res.json({ success: true, message: 'Không có học viên nào quá hạn' });
    }

    // 3. Khóa tài khoản (Dùng Model)
    await feeModel.lockStudentAccounts(studentIdsToLock);

    res.json({
      success: true,
      message: `Đã khóa ${studentIdsToLock.length} tài khoản học viên do quá hạn học phí`,
      lockedAccountIds: studentIdsToLock
    });

  } catch (err) {
    console.error('❌ Lỗi checkAndLockOverdueAccounts:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xử lý tài khoản quá hạn' });
  }
};