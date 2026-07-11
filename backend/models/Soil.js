const mongoose = require("mongoose");

const soilSchema = new mongoose.Schema({
  farmerName: String,
  ph: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  moisture: Number,
  recommendation: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Soil", soilSchema);
