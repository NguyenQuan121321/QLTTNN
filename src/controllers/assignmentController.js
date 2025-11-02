const assignmentModel = require('../models/assignmentModel');
// (MỚI) Import enrollmentModel để kiểm tra quyền của học viên
const enrollmentModel = require('../models/enrollmentModel'); 

/**
 * ➕ Tạo bài tập mới (ĐÃ FIX LỖI)
 */
exports.createAssignment = async (req, res) => {
  try {
    const { lopHocId, tieuDe, moTa, hanNop } = req.body;
    let giaoVienId;

    if (req.user.role === 'ADMIN') {
      // Nếu là Admin, phải cung cấp giaoVienId trong body
      giaoVienId = req.body.giaoVienId;
      if (!giaoVienId) {
        return res.status(400).json({ success: false, message: 'Admin phải cung cấp giaoVienId để gán bài tập' });
      }
    } else {
      // Nếu là GIAOVIEN, tự động lấy id của họ
      giaoVienId = req.user.id;
    }
    
    const assignmentData = { lopHocId, tieuDe, moTa, hanNop, giaoVienId };
    const newAssignment = await assignmentModel.create(assignmentData);
    res.status(201).json({ success: true, message: 'Giao bài tập thành công', data: newAssignment });

  } catch (err) {
    console.error('❌ Lỗi createAssignment:', err);
    // Bắt lỗi khóa ngoại nếu lopHocId hoặc giaoVienId không tồn tại
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ success: false, message: 'Lỗi khóa ngoại: lopHocId hoặc giaoVienId không tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi giao bài tập' });
  }
};

/**
 * ✏️ Cập nhật bài tập (Không đổi, logic đã đúng)
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await assignmentModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }
    if (req.user.role !== 'ADMIN' && existing.giaoVienId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bài tập này' });
    }
    await assignmentModel.update(id, req.body);
    res.json({ success: true, message: 'Cập nhật giáo viên thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateAssignment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bài tập' });
  }
};

/**
 * 🗑️ Xóa bài tập (Không đổi, logic đã đúng)
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await assignmentModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }
    if (req.user.role !== 'ADMIN' && existing.giaoVienId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài tập này' });
    }
    await assignmentModel.remove(id);
    res.json({ success: true, message: 'Xóa bài tập thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteAssignment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa bài tập' });
  }
};

/**
 * 🔍 Lấy chi tiết bài tập (ĐÃ FIX TODO)
 */
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await assignmentModel.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }

    // (FIX) Kiểm tra xem user (HOCVIEN) có thuộc lớp này không
    if (req.user.role === 'HOCVIEN') {
      const isEnrolled = await enrollmentModel.checkEnrollment(req.user.id, assignment.lopHocId);
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem bài tập này' });
      }
    }
    // Admin/GiaoVien (của lớp) có thể xem
    
    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error('❌ Lỗi getAssignmentById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * 📚 Lấy bài tập theo lớp học (ĐÃ FIX TODO)
 */
exports.getAssignmentsByClass = async (req, res) => {
  try {
    const { lopHocId } = req.params;
    
    // (FIX) Kiểm tra xem user (HOCVIEN) có thuộc lớp này không
    if (req.user.role === 'HOCVIEN') {
      const isEnrolled = await enrollmentModel.checkEnrollment(req.user.id, lopHocId);
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem bài tập của lớp này' });
      }
    }
    
    const assignments = await assignmentModel.findByClassId(lopHocId);
    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('❌ Lỗi getAssignmentsByClass:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};