const db = require('../config/database');

/**
 * 📜 Lấy danh sách tất cả chứng chỉ
 */
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await db('ChungChi')
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
    const cert = await db('ChungChi').where({ id }).first();

    if (!cert)
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ' });

    res.json({ success: true, data: cert });
  } catch (err) {
    console.error('❌ Lỗi getCertificateById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin chứng chỉ' });
  }
};

/**
 * ➕ Tạo mới chứng chỉ
 */
exports.createCertificate = async (req, res) => {
  try {
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
    } = req.body;

    if (!hocVienId || !tenChungChi)
      return res.status(400).json({ success: false, message: 'Thiếu mã học viên hoặc tên chứng chỉ' });

    // ✅ Kiểm tra học viên tồn tại
    const hv = await db('HocVien').where({ id: hocVienId }).first();
    if (!hv) {
      return res.status(400).json({
        success: false,
        message: `Học viên với ID ${hocVienId} không tồn tại`
      });
    }

    // ✅ Kiểm tra xem học viên này đã có chứng chỉ này chưa
    const existingCert = await db('ChungChi')
      .where({ hocVienId, maChungChi })
      .first();

    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: `Học viên ID ${hocVienId} đã có chứng chỉ mã ${maChungChi} rồi`
      });
    }

    // ✅ Thêm chứng chỉ mới
    const [newCertId] = await db('ChungChi').insert({
      hocVienId,
      maChungChi,
      tenChungChi,
      ngayCap,
      nguoiKy,
      hieuLucDen,
      filePDF,
      qrCode,
      trangThai: trangThai || 'valid'
    });

    res.status(201).json({
      success: true,
      message: 'Thêm chứng chỉ thành công',
      id: newCertId
    });
  } catch (err) {
    console.error('❌ Lỗi createCertificate:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm chứng chỉ' });
  }
};

/**
 * ✏️ Cập nhật chứng chỉ
 */
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    const updated = await db('ChungChi').where({ id }).update({
      hocVienId,
      maChungChi,
      tenChungChi,
      ngayCap,
      nguoiKy,
      hieuLucDen,
      filePDF,
      qrCode,
      trangThai
    });

    if (!updated)
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ để cập nhật' });

    res.json({ success: true, message: 'Cập nhật chứng chỉ thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateCertificate:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật chứng chỉ' });
  }
};

/**
 * 🗑️ Vô hiệu hóa (hoặc xóa) chứng chỉ
 */
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('ChungChi').where({ id }).update({ trangThai: 'expired' });

    if (!deleted)
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ để vô hiệu hóa' });

    res.json({ success: true, message: 'Đã vô hiệu hóa chứng chỉ thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteCertificate:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa chứng chỉ' });
  }
};