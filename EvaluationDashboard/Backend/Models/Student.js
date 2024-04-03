const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    required: true
  },
  ideation: { type: Number, default: null, min: 0, max: 10 },
  execution: { type: Number, default: null, min: 0, max: 10 },
  vivaPitch: { type: Number, default: null, min: 0, max: 10 },
  marksSubmitted: {type: String, default:""}
});

module.exports = mongoose.model("Students", studentSchema);

