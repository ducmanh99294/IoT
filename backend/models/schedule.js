const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  lightId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "light", 
    required: true 
    },
  action: { 
    type: String, 
    enum: ["ON", "OFF"], 
    required: true },
  time: { 
    type: String, 
    required: true 
  },
  enabled: { 
    type: Boolean, 
    default: true 
    },
  createdAt: { 
    type: Date, 
    default: Date.now 
    },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
