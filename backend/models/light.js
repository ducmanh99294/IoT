const mongoose = require('mongoose');

const LightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,       // Tên đèn, ví dụ "light1"
  },
  status: {
    type: Boolean,
    default: false,       // Trạng thái đèn: bật (true) hoặc tắt (false)
  },
  brightness: {
    type: Number,
    default: 0,           // Độ sáng từ 0 đến 100
    min: 0,
    max: 100,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,    
  }
});

const Light = mongoose.model('light', LightSchema, "light");

module.exports = Light;
