const db = require('../config/database'); //

/**
 * 📊 Lấy số liệu thống kê tổng quan
 */
const getOverallStats = async () => {
    // 1. Đếm Học viên (Active)
    const activeStudentCountPromise = db('HocVien') //
        .where({ status: 'active' })
        .count('id as count')
        .first();

    // 2. Đếm Giáo viên (Active)
    const activeTeacherCountPromise = db('GiaoVien') //
        .where({ status: 'active' })
        .count('id as count')
        .first();

    // 3. Đếm Lớp học (Đang mở)
    const openClassCountPromise = db('LopHoc') //
        .where({ trangThai: 'Mo' }) // Hoặc 'OPEN' nếu dùng DB mới
        .count('id as count')
        .first();

    // 4. Tính Tổng học phí đã thu (trong tháng hiện tại - ví dụ)
    const currentMonth = new Date().getMonth() + 1; // Tháng hiện tại (1-12)
    const currentYear = new Date().getFullYear(); // Năm hiện tại
    const totalRevenueThisMonthPromise = db('Payments') //
        // Lọc theo tháng và năm của ngayThanhToan
        .whereRaw('MONTH(ngayThanhToan) = ?', [currentMonth])
        .whereRaw('YEAR(ngayThanhToan) = ?', [currentYear])
        .sum('soTien as total')
        .first();

    // 5. Tính Tổng công nợ (Học phí chưa thanh toán + quá hạn)
    const totalDebtPromise = db('HocPhi') //
        .whereIn('trangThai', ['unpaid', 'partial', 'overdue'])
        // Cần tính số tiền còn nợ = soTien - SUM(payments.soTien)
        // Đây là một query phức tạp hơn, tạm thời lấy tổng số tiền của các phiếu chưa paid/overdue
        .sum('soTien as total') // Tạm tính tổng các phiếu chưa đóng đủ
        .first();


    // Chạy các query song song
    const [
        activeStudentCountResult,
        activeTeacherCountResult,
        openClassCountResult,
        totalRevenueThisMonthResult,
        totalDebtResult
    ] = await Promise.all([
        activeStudentCountPromise,
        activeTeacherCountPromise,
        openClassCountPromise,
        totalRevenueThisMonthPromise,
        totalDebtPromise
    ]);

    // Trả về object chứa các số liệu
    return {
        activeStudents: activeStudentCountResult.count || 0,
        activeTeachers: activeTeacherCountResult.count || 0,
        openClasses: openClassCountResult.count || 0,
        revenueThisMonth: totalRevenueThisMonthResult.total || 0,
        // Lưu ý: totalDebt này chưa chính xác hoàn toàn nếu có partial payment
        estimatedTotalDebt: totalDebtResult.total || 0
    };
};

// Có thể thêm các hàm khác để lấy dữ liệu biểu đồ, hoạt động gần đây...
// Ví dụ: Lấy 5 học viên đăng ký gần nhất
const getRecentStudents = () => {
    return db('HocVien')
        .join('User', 'HocVien.id', 'User.id')
        .orderBy('registrationDate', 'desc')
        .limit(5)
        .select('HocVien.code', 'User.fullName', 'HocVien.registrationDate');
}


module.exports = {
  getOverallStats,
  getRecentStudents // Xuất hàm mới nếu có
};