// (MỚI) Gọi Model
const certificateModel = require('../models/certificateModel');
// (MỚI) Gọi studentModel để kiểm tra học viên tồn tại
const studentModel = require('../models/studentModel');

/**
 * 📜 Lấy danh sách tất cả chứng chỉ
 */
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await certificateModel.findAll();
    res.json({ success: true, data: certificates });
  } catch (err) {
    console.error('❌ Lỗi getAllCertificates:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách chứng chỉ' });
  }
};

/**
 * 🔍 Lấy chi tiết 1 chứng chỉ theo ID
 */
exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await certificateModel.findById(id);

    if (!cert)
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ' });

    res.json({ success: true, data: cert });
  } catch (err) {
    console.error('❌ Lỗi getCertificateById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin chứng chỉ' });
  }
};

/**
 * ➕ Tạo mới chứng chỉ (Controller xử lý validation)
 */
exports.createCertificate = async (req, res) => {
  try {
    const certificateData = req.body;
    const { hocVienId, maChungChi, tenChungChi, examId } = certificateData;

    // 1. Validate dữ liệu đầu vào cơ bản
    if (!hocVienId || !tenChungChi)
      return res.status(400).json({ success: false, message: 'Thiếu mã học viên hoặc tên chứng chỉ' });

    // 2. ✅ Kiểm tra học viên tồn tại (Dùng studentModel)
    const student = await studentModel.findById(hocVienId); // findById trả về chi tiết hoặc null
    if (!student) {
      return res.status(400).json({
        success: false,
        message: `Học viên với ID ${hocVienId} không tồn tại`
      });
    }

    // 3. ✅ Kiểm tra điểm thi (Dùng certificateModel.findExamResult)
    if (examId) {
      const examResult = await certificateModel.findExamResult(hocVienId, examId);
      if (!examResult) {
         return res.status(400).json({
          success: false,
          message: `Học viên (ID ${hocVienId}) chưa có điểm cho kỳ thi (ID ${examId})`
        });
      }
      if (examResult.diem < 70) {
         return res.status(400).json({
          success: false,
          message: `Học viên không đạt điểm thi (Điểm: ${examResult.diem}/100, Yêu cầu: 70/100)`
        });
      }
    } else {
       return res.status(400).json({
          success: false,
          message: `Cần cung cấp 'examId' để kiểm tra điều kiện cấp chứng chỉ`
        });
    }

    // 4. ✅ Kiểm tra trùng lặp chứng chỉ (Dùng certificateModel.findByStudentAndCode)
     if (maChungChi) { // Chỉ kiểm tra nếu có mã CC
        const existingCert = await certificateModel.findByStudentAndCode(hocVienId, maChungChi);
        if (existingCert) {
          return res.status(400).json({
            success: false,
            message: `Học viên ID ${hocVienId} đã có chứng chỉ mã ${maChungChi} rồi`
          });
        }
     }


    // 5. ✅ Nếu mọi thứ hợp lệ, gọi Model để tạo
    const [newCertId] = await certificateModel.create(certificateData);

    res.status(201).json({
      success: true,
      message: 'Thêm chứng chỉ thành công (đã xác thực điểm thi)',
      id: newCertId
    });
  } catch (err) {
    console.error('❌ Lỗi createCertificate:', err);
     // Xử lý lỗi cụ thể nếu Model ném ra (ví dụ: lỗi DB)
     if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('maChungChi')) { // Ví dụ check lỗi unique maChungChi
         return res.status(400).json({ success: false, message: `Mã chứng chỉ '${req.body.maChungChi}' đã tồn tại.` });
     }
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm chứng chỉ' });
  }
};

/**
 * ✏️ Cập nhật chứng chỉ
 */
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await certificateModel.update(id, req.body);

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ để cập nhật' });

    res.json({ success: true, message: 'Cập nhật chứng chỉ thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateCertificate:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật chứng chỉ' });
  }
};

/**
 * 🗑️ Vô hiệu hóa chứng chỉ
 */
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    // Gọi hàm disable từ Model
    const disabled = await certificateModel.disable(id);

    if (!disabled)
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ để vô hiệu hóa' });

    res.json({ success: true, message: 'Đã vô hiệu hóa chứng chỉ thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteCertificate:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi vô hiệu hóa chứng chỉ' });
  }
};