const Schedule = require('../models/schedule');
const Light = require('../models/light');

exports.getAllSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.find().populate('lightId', 'name');
        res.json({
            success: true,
            data: schedule
        });
    } catch (err) {
        console.error("Lỗi getAllSchedule:", err);
        res.status(500).json({ message: "Lỗi server khi lấy lịch" });
    }
} 

exports.createSchedule = async (req, res) => {
  try {
    const { lightId, action, time } = req.body;

    const schedule = await Schedule.create({
      lightId,
      action: action.toUpperCase(),
      time,
      enabled: true
    });

    return res.json({
      success: true,
      message: "Đã tạo lịch hẹn giờ!",
      schedule
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo lịch" });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Không tìm thấy lịch!" });

    schedule.enabled = !schedule.enabled;
    await schedule.save();

    res.json({
      success: true,
      message: schedule.enabled ? "Đã bật lịch hẹn giờ" : "Đã tắt lịch hẹn giờ",
      schedule
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật lịch" });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch cần xóa!"
      });
    }

    await Schedule.findByIdAndDelete(scheduleId);

    res.json({
      success: true,
      message: "Đã xóa lịch thành công!",
      deletedId: scheduleId
    });

  } catch (err) {
    console.error("❌ Lỗi xóa lịch:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa lịch!" });
  }
};
