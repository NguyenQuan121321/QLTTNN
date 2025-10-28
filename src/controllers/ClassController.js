const db = require('../config/database');

/**
 * 📋 Lấy danh sách lớp học (có join giáo viên, môn học, phòng học)
 */
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await db('LopHoc')
      .leftJoin('GiaoVien', 'LopHoc.giaoVienId', 'GiaoVien.id')
      .leftJoin('MonHoc', 'LopHoc.monHocId', 'MonHoc.maMonHoc')
      .leftJoin('PhongHoc', 'LopHoc.phongHocId', 'PhongHoc.maPhong')
      .select(
        'LopHoc.id',
        'LopHoc.maLop',
        'LopHoc.tenLop',
        'LopHoc.siSoToiDa',
        'LopHoc.trangThai',
        'LopHoc.ngayBatDau',
        'LopHoc.ngayKetThuc',
        'GiaoVien.maGV',
        'MonHoc.tenMonHoc',
        'PhongHoc.tenPhong'
      );

    res.json({ success: true, data: classes });
  } catch (err) {
    console.error('❌ Lỗi getAllClasses:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách lớp học' });
  }
};

/**
 * 🔍 Lấy chi tiết lớp học theo ID
 */
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const lop = await db('LopHoc')
      .leftJoin('GiaoVien', 'LopHoc.giaoVienId', 'GiaoVien.id')
      .leftJoin('MonHoc', 'LopHoc.monHocId', 'MonHoc.maMonHoc')
      .leftJoin('PhongHoc', 'LopHoc.phongHocId', 'PhongHoc.maPhong')
      .select(
        'LopHoc.id',
        'LopHoc.maLop',
        'LopHoc.tenLop',
        'LopHoc.siSoToiDa',
        'LopHoc.trangThai',
        'LopHoc.ngayBatDau',
        'LopHoc.ngayKetThuc',
        'GiaoVien.maGV',
        'MonHoc.tenMonHoc',
        'PhongHoc.tenPhong'
      )
      .where('LopHoc.id', id)
      .first();

    if (!lop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    res.json({ success: true, data: lop });
  } catch (err) {
    console.error('❌ Lỗi getClassById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy lớp học' });
  }
};

/**
 * ➕ Tạo lớp học
 */
exports.createClass = async (req, res) => {
  try {
    const { maLop, tenLop, siSoToiDa, ngayBatDau, ngayKetThuc, monHocId, phongHocId, giaoVienId } = req.body;

    if (siSoToiDa > 50) {
      return res.status(400).json({ success: false, message: 'Sĩ số tối đa không được vượt quá 50' });
    }

    const [classId] = await db('LopHoc').insert({
      maLop,
      tenLop,
      siSoToiDa,
      ngayBatDau,
      ngayKetThuc,
      trangThai: 'Mo',
      monHocId,
      phongHocId,
      giaoVienId
    });

    res.status(201).json({ success: true, message: 'Tạo lớp học thành công', id: classId });
  } catch (err) {
    console.error('❌ Lỗi createClass:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo lớp học' });
  }
};

/**
 * ✏️ Cập nhật lớp học
 */
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenLop, siSoToiDa, ngayKetThuc, trangThai } = req.body;

    if (siSoToiDa && siSoToiDa > 50) {
      return res.status(400).json({ success: false, message: 'Sĩ số tối đa không được vượt quá 50' });
    }

    const updated = await db('LopHoc').where({ id }).update({
      tenLop,
      siSoToiDa,
      ngayKetThuc,
      trangThai
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để cập nhật' });

    res.json({ success: true, message: 'Cập nhật lớp học thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateClass:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật lớp học' });
  }
};

/**
 * 🚫 Đóng lớp học (xóa mềm)
 */
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db('LopHoc').where({ id }).update({ trangThai: 'Dong' });

    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để đóng' });

    res.json({ success: true, message: 'Đã đóng lớp học thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteClass:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa lớp học' });
  }
};
