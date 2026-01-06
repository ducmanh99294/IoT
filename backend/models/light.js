const mongoose = require('mongoose');

const LightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   
  },
  status: {
    type: Boolean,
    default: false,      
  },
  lastUpdated: {
    type: Date,
    default: Date.now,    
  }
});

const Light = mongoose.model('light', LightSchema, "light");

module.exports = Light;
