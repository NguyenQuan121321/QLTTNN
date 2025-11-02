// (MỚI) Gọi Model
const attendanceModel = require('../models/attendanceModel');

/**
 * ✍️ Ghi nhận điểm danh
 */
exports.recordAttendance = async (req, res) => {
  try {
    const attendanceData = {
        ...req.body,
        giaoVienId: req.user.id // Lấy ID giáo viên từ token đã xác thực
    };
    
    // TODO: Validate input data (lopHocId, hocVienId exist?)

    await attendanceModel.create(attendanceData);

    res.status(201).json({ success: true, message: 'Điểm danh thành công' });
  } catch (err) {
    console.error('❌ Lỗi recordAttendance:', err);
     // if (err.message.includes('đã được điểm danh')) { // Xử lý lỗi duplicate từ Model
     //   return res.status(400).json({ success: false, message: err.message });
     // }
    res.status(500).json({ success: false, message: 'Lỗi server khi điểm danh' });
  }
};

/**
 * 📊 Lấy lịch sử điểm danh của 1 lớp
 */
exports.getAttendanceByClass = async (req, res) => {
  try {
    const { lopHocId } = req.params;
    const records = await attendanceModel.findByClass(lopHocId);
    res.json({ success: true, data: records });
  } catch (err) {
     console.error('❌ Lỗi getAttendanceByClass:', err); // Thêm log lỗi chi tiết
     res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử điểm danh' });
  }
};

/**
 * ⚠️ (US Admin) Lấy trạng thái chuyên cần (Cảnh báo/Cấm thi)
 */
exports.getAttendanceStatus = async (req, res) => {
  try {
    const { lopHocId, hocVienId } = req.params;

    // "Nhờ" Model đếm số buổi nghỉ
    const result = await attendanceModel.countUnexcusedAbsences(lopHocId, hocVienId);
    const totalAbsences = result.totalAbsences || 0;

    // Controller xử lý logic nghiệp vụ (cảnh báo/cấm thi)
    let status = 'OK';
    let message = `Học viên vắng ${totalAbsences} buổi (không phép).`;

    if (totalAbsences >= 3) {
      status = 'BANNED'; // Cấm thi
      message = `CẤM THI: Học viên vắng ${totalAbsences} buổi (không phép).`;
    } else if (totalAbsences >= 2) {
      status = 'WARNING'; // Cảnh báo
      message = `CẢNH BÁO: Học viên vắng ${totalAbsences} buổi (không phép).`;
    }

    // Controller trả về kết quả
    res.json({
      success: true,
      data: {
        hocVienId: parseInt(hocVienId, 10), // Đảm bảo trả về số
        lopHocId: parseInt(lopHocId, 10),   // Đảm bảo trả về số
        totalAbsences,
        status,
        message
      }
    });
  } catch (err) {
    console.error('❌ Lỗi getAttendanceStatus:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy trạng thái chuyên cần' });
  }
};