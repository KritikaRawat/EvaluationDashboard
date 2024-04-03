const mongoose = require('mongoose');
const { Schema } = mongoose;

const mentorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  noAssignedStudents:{
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.model('Mentor', mentorSchema);