const submissionModel = require('../models/submissionModel');
const assignmentModel = require('../models/assignmentModel');
// (MỚI) Import enrollmentModel để kiểm tra quyền của học viên
const enrollmentModel = require('../models/enrollmentModel');

/**
 * 📤 Học viên nộp bài (ĐÃ FIX TODO)
 */
exports.submitAssignment = async (req, res) => {
  try {
    const hocVienId = req.user.id;
    const { baiTapId, filePath, noiDung } = req.body;

    const assignment = await assignmentModel.findById(baiTapId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }

    if (assignment.hanNop && new Date() > new Date(assignment.hanNop)) {
      return res.status(400).json({ success: false, message: 'Đã quá hạn nộp bài' });
    }
    
    // (FIX) Kiểm tra xem học viên này có thuộc lớp của bài tập này không
    const isEnrolled = await enrollmentModel.checkEnrollment(hocVienId, assignment.lopHocId);
    if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'Bạn không thuộc lớp học này để nộp bài' });
    }

    const submissionData = { baiTapId, hocVienId, filePath, noiDung };
    const newSubmission = await submissionModel.create(submissionData);
    
    res.status(201).json({ success: true, message: 'Nộp bài thành công', data: newSubmission });

  } catch (err) {
    console.error('❌ Lỗi submitAssignment:', err);
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Bạn đã nộp bài này rồi.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài' });
  }
};

/**
 * 💯 Giáo viên chấm điểm (ĐÃ FIX TODO)
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params; // id của NopBai
    const { diem, nhanXet } = req.body;

    if (diem === undefined || nhanXet === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập điểm và nhận xét' });
    }
    
    const submission = await submissionModel.findById(id);
    if (!submission) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });
    }

    // (FIX) Kiểm tra xem giáo viên (req.user) có phải là GV gán bài này không
    if (req.user.role === 'GIAOVIEN') {
        const assignment = await assignmentModel.findById(submission.baiTapId);
        // Chỉ GV gán bài tập mới được chấm
        if (assignment.giaoVienId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền chấm bài tập này' });
        }
    }
    // Admin thì luôn được chấm

    await submissionModel.grade(id, { diem, nhanXet });
    res.json({ success: true, message: 'Chấm điểm thành công' });

  } catch (err) {
    console.error('❌ Lỗi gradeSubmission:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi chấm điểm' });
  }
};

/**
 * 📑 Lấy tất cả bài nộp của 1 bài tập (ĐÃ FIX TODO)
 */
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { baiTapId } = req.params;
    
    // (FIX) Kiểm tra giáo viên (req.user) có dạy lớp này không
    if (req.user.role === 'GIAOVIEN') {
        const assignment = await assignmentModel.findById(baiTapId);
        if (!assignment) {
             return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
        }
        if (assignment.giaoVienId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem các bài nộp này' });
        }
    }
    // Admin thì luôn được xem
    
    const submissions = await submissionModel.findByAssignmentId(baiTapId);
    res.json({ success: true, data: submissions });
  } catch (err) {
    console.error('❌ Lỗi getSubmissionsByAssignment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * 🧑‍🎓 Lấy bài nộp của chính học viên đó (Không đổi, logic đã đúng)
 */
exports.getStudentSubmission = async (req, res) => {
    try {
        const { baiTapId } = req.params;
        const hocVienId = req.user.id; 

        const submission = await submissionModel.findByAssignmentAndStudent(baiTapId, hocVienId);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Bạn chưa nộp bài tập này' });
        }
        
        res.json({ success: true, data: submission });
    } catch (err) {
        console.error('❌ Lỗi getStudentSubmission:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};