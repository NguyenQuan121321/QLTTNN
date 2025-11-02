// Dòng đầu tiên PHẢI là ../ (một dấu chấm)
const db = require('../config/database'); 

const assignmentModel = {
  /**
   * Tạo bài tập mới
   */
  create: async (data) => {
    const [insertId] = await db('BaiTap').insert(data);
    return { id: insertId, ...data };
  },

  /**
   * Cập nhật bài tập
   */
  update: async (id, data) => {
    const { tieuDe, moTa, filePath, hanNop } = data;
    const updateData = { tieuDe, moTa, filePath, hanNop };
    return db('BaiTap').where({ id }).update(updateData);
  },

  /**
   * Xóa bài tập
   */
  remove: async (id) => {
    return db('BaiTap').where({ id }).del();
  },

  /**
   * Lấy bài tập theo ID
   */
  findById: async (id) => {
    return db('BaiTap').where({ id }).first();
  },

  /**
   * Lấy tất cả bài tập của một lớp học
   */
  findByClassId: async (lopHocId) => {
    return db('BaiTap')
      .where({ lopHocId })
      .orderBy('ngayGiao', 'desc');
  }
};

module.exports = assignmentModel;