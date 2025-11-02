// Dòng đầu tiên PHẢI là ../ (một dấu chấm)
const db = require('../config/database'); 

const submissionModel = {
  /**
   * Học viên nộp bài (hoặc nộp lại)
   */
  create: async (data) => {
    const { baiTapId, hocVienId, filePath, noiDung } = data;

    const insertData = {
      baiTapId,
      hocVienId,
      filePath,
      noiDung,
      ngayNop: db.fn.now()
    };

    const updateData = {
      filePath,
      noiDung,
      ngayNop: db.fn.now(),
      diem: null,
      nhanXet: null,
      ngayCham: null
    };

    // 1. Thực hiện insert hoặc update
    await db('NopBai')
      .insert(insertData)
      .onConflict(['baiTapId', 'hocVienId']) 
      .merge(updateData);

    // 2. Query lại để lấy data mới nhất
    const newSubmission = await db('NopBai')
      .where({ baiTapId, hocVienId })
      .first();

    return newSubmission; 
  },

  /**
   * Giáo viên chấm điểm
   */
  grade: async (id, data) => {
    const { diem, nhanXet } = data;
    const gradeData = {
      diem,
      nhanXet,
      ngayCham: db.fn.now()
    };
    return db('NopBai').where({ id }).update(gradeData);
  },

  /**
   * Lấy tất cả bài nộp của 1 bài tập (cho giáo viên)
   */
  findByAssignmentId: async (baiTapId) => {
    return db('NopBai')
      .join('User', 'NopBai.hocVienId', 'User.id')
      .select('NopBai.*', 'User.fullName', 'User.email')
      .where('NopBai.baiTapId', baiTapId)
      .orderBy('NopBai.ngayNop', 'desc');
  },

  /**
   * Lấy bài nộp của 1 học viên cho 1 bài tập
   */
  findByAssignmentAndStudent: async (baiTapId, hocVienId) => {
    return db('NopBai')
      .where({ baiTapId, hocVienId })
      .first();
  },

  /**
   * Lấy bài nộp theo ID (để chấm điểm)
   */
  findById: async (id) => {
    return db('NopBai').where({ id }).first();
  }
};

module.exports = submissionModel;