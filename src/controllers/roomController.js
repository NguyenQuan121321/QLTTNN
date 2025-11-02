// (MỚI) Gọi Model
const roomModel = require('../models/roomModel');

/**
 * 📋 Lấy tất cả phòng học
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomModel.findAll();
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error('❌ Lỗi getAllRooms:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy phòng học' });
  }
};

/**
 * 🔍 Lấy phòng học theo mã phòng
 */
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params; // 'id' ở đây thực chất là 'maPhong' từ route
    const room = await roomModel.findById(id);

    if (!room) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng học' });
    }
    res.json({ success: true, data: room });
  } catch (err) {
    console.error('❌ Lỗi getRoomById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy phòng học' });
  }
};

/**
 * ➕ Tạo phòng học
 */
exports.createRoom = async (req, res) => {
  try {
    await roomModel.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo phòng học thành công' });
  } catch (err) {
    console.error('❌ Lỗi createRoom:', err);
     // Xử lý lỗi trùng mã phòng (nếu có từ CSDL)
     if (err.code === 'ER_DUP_ENTRY') {
       return res.status(400).json({ success: false, message: `Mã phòng '${req.body.maPhong}' đã tồn tại.` });
     }
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo phòng học' });
  }
};

/**
 * ✏️ Cập nhật phòng học
 */
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params; // 'id' là 'maPhong'
    const updated = await roomModel.update(id, req.body);

    if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng học để cập nhật' });
    }
    res.json({ success: true, message: 'Cập nhật phòng học thành công' });
  } catch (err) {
    console.error('❌ Lỗi updateRoom:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật phòng học' });
  }
};

/**
 * 🗑️ Xóa phòng học
 */
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params; // 'id' là 'maPhong'
    const deleted = await roomModel.remove(id);

    // Model.remove bây giờ ném lỗi nếu không xóa được, nên không cần check deleted === 0 nữa
    // if (!deleted) {
    //     return res.status(404).json({ success: false, message: 'Không tìm thấy phòng học để xóa' });
    // }

    res.json({ success: true, message: 'Xóa phòng học thành công' });
  } catch (err) {
    console.error('❌ Lỗi deleteRoom:', err);
    // (MỚI) Xử lý lỗi ràng buộc khóa ngoại từ Model
    if (err.message.includes('Không thể xóa phòng')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    // Xử lý lỗi không tìm thấy (nếu model.remove không ném lỗi mà trả về 0)
    // Hoặc lỗi chung
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa phòng học' });
  }
};