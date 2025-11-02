// (MỚI) Gọi Model
const dashboardModel = require('../models/dashboardModel');

/**
 * 📊 Lấy dữ liệu thống kê cho Dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Gọi các hàm từ Model để lấy dữ liệu
    const overallStatsPromise = dashboardModel.getOverallStats();
    const recentStudentsPromise = dashboardModel.getRecentStudents(); // Ví dụ lấy thêm data khác

    // Chờ tất cả dữ liệu được lấy về
    const [overallStats, recentStudents] = await Promise.all([
        overallStatsPromise,
        recentStudentsPromise
    ]);

    // Gộp kết quả và trả về
    res.json({
        success: true,
        data: {
            stats: overallStats,
            recentActivity: {
                students: recentStudents
                // Thêm hoạt động khác nếu cần (vd: lớp sắp mở)
            }
        }
     });

  } catch (err) {
    console.error('❌ Lỗi getDashboardStats:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu dashboard.' });
  }
};