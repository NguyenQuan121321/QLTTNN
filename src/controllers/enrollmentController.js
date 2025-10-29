// (MỚI) Gọi các Model liên quan
const enrollmentModel = require('../models/enrollmentModel');
const studentModel = require('../models/studentModel');
const classModel = require('../models/classModel');
const feeModel = require('../models/feeModel'); // Để tự động tạo học phí

/**
 * ➕ Ghi danh học viên vào lớp
 */
exports.enrollStudent = async (req, res) => {
  try {
    const { hocVienId, lopHocId } = req.body;

    // 1. Validate đầu vào cơ bản
    if (!hocVienId || !lopHocId) {
      return res.status(400).json({ success: false, message: 'Thiếu ID học viên hoặc ID lớp học.' });
    }

    // 2. Kiểm tra học viên và lớp học tồn tại
    const studentPromise = studentModel.findById(hocVienId);
    const classPromise = classModel.findById(lopHocId);
    const [student, lopHoc] = await Promise.all([studentPromise, classPromise]);

    if (!student) {
      return res.status(404).json({ success: false, message: `Học viên ID ${hocVienId} không tồn tại.` });
    }
    if (!lopHoc) {
      return res.status(404).json({ success: false, message: `Lớp học ID ${lopHocId} không tồn tại.` });
    }
    // (Optional) Kiểm tra trạng thái lớp (vd: chỉ ghi danh vào lớp 'OPEN'/'Mo')
    if (lopHoc.trangThai !== 'Mo' && lopHoc.trangThai !== 'OPEN') { // Check cả 2 kiểu enum
         return res.status(400).json({ success: false, message: `Không thể ghi danh vào lớp đã ${lopHoc.trangThai}.` });
    }
    // (Optional) Kiểm tra sĩ số lớp
    // Cần query count số enrollment 'active' cho lớp này
    // const currentEnrollments = await db('Enrollment').where({lopHocId, status: 'active'}).count('id as count').first();
    // if (currentEnrollments.count >= lopHoc.siSoToiDa) { ... }


    // 3. Kiểm tra xem đã ghi danh chưa (Dùng Model)
    const existing = await enrollmentModel.findExisting(hocVienId, lopHocId);
    if (existing) {
      return res.status(400).json({ success: false, message: `Học viên '${student.fullName}' đã ghi danh vào lớp '${lopHoc.tenLop}' rồi.` });
    }

    // 4. Thực hiện ghi danh (Dùng Model)
    const [newEnrollmentId] = await enrollmentModel.create({ hocVienId, lopHocId });

    // 5. (QUAN TRỌNG) Tự động tạo học phí cho lần ghi danh này
    // Cần lấy thông tin học phí từ Môn học hoặc Lớp học (database hiện chưa có cột học phí chuẩn)
    // Giả sử lấy học phí từ Môn học (cần thêm cột 'hocPhi' vào bảng MonHoc)
    // Hoặc lấy 1 giá trị cố định, hoặc truyền `soTien` vào req.body khi ghi danh
    const feeAmount = lopHoc.hocPhi // Giả sử bảng LopHoc có cột hocPhi
                      || 2000000; // Hoặc một giá trị mặc định
    const dueDate = new Date(); // Lấy hạn đóng mặc định (vd: 7 ngày sau)
    dueDate.setDate(dueDate.getDate() + 7);

    await feeModel.create({
        hocVienId,
        lopHocId,
        soTien: feeAmount,
        hanDong: dueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        // description: `Học phí lớp ${lopHoc.tenLop}` // Nếu DB mới có description
    });


    res.status(201).json({
      success: true,
      message: `Ghi danh học viên '${student.fullName}' vào lớp '${lopHoc.tenLop}' thành công. Đã tạo phiếu thu học phí.`,
      enrollmentId: newEnrollmentId
    });

  } catch (err) {
    console.error('❌ Lỗi enrollStudent:', err);
    if (err.message.includes('Thiếu ID')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi ghi danh học viên.' });
  }
};

/**
 * 📋 Lấy danh sách ghi danh (lọc theo studentId hoặc classId)
 */
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await enrollmentModel.findAll(req.query); // Truyền query params để lọc
    res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error('❌ Lỗi getAllEnrollments:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách ghi danh.' });
  }
};

/**
 * 🔍 Lấy chi tiết một lượt ghi danh
 */
exports.getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await enrollmentModel.findById(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lượt ghi danh.' });
    }
    res.json({ success: true, data: enrollment });
  } catch (err) {
    console.error('❌ Lỗi getEnrollmentById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết ghi danh.' });
  }
};

/**
 * 🔄 Cập nhật trạng thái ghi danh
 */
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Trạng thái mới: 'active', 'withdrawn', 'completed'

    if (!status) {
         return res.status(400).json({ success: false, message: 'Thiếu trạng thái mới (status).' });
    }

    const updated = await enrollmentModel.updateStatus(id, status);
    if (!updated) {
       return res.status(404).json({ success: false, message: 'Không tìm thấy lượt ghi danh để cập nhật.' });
    }

    res.json({ success: true, message: `Cập nhật trạng thái ghi danh thành '${status}' thành công.` });

  } catch (err) {
    console.error('❌ Lỗi updateEnrollmentStatus:', err);
     if (err.message.includes('Trạng thái không hợp lệ')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái ghi danh.' });
  }
};

/**
 * 🗑️ Xóa/Hủy ghi danh (Nên dùng update thành 'withdrawn')
 */
exports.deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

     // Thay vì xóa cứng, cập nhật status thành 'withdrawn' sẽ tốt hơn
     const updated = await enrollmentModel.updateStatus(id, 'withdrawn');
     if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy lượt ghi danh để hủy.' });
     }
     res.json({ success: true, message: 'Đã hủy ghi danh (cập nhật trạng thái thành withdrawn).' });

    // Nếu vẫn muốn xóa cứng:
    // const deleted = await enrollmentModel.remove(id);
    // if (!deleted) {
    //   return res.status(404).json({ success: false, message: 'Không tìm thấy lượt ghi danh để xóa.' });
    // }
    // res.json({ success: true, message: 'Xóa lượt ghi danh thành công.' });

  } catch (err) {
    console.error('❌ Lỗi deleteEnrollment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa/hủy ghi danh.' });
  }
};