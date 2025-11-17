const Light = require('../models/light');

exports.getAllLights = async (req, res) => {
  try {
    const lights = await Light.find(); // lấy tất cả đèn
    res.json({
      success: true,
      data: lights
    });
  } catch (err) {
    console.error("Lỗi getAllLight:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

