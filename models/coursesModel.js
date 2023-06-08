const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  courseNo:{
    type: Number,
    required:true
  },
  courseDesc:{
    type:String,
    required:true
  },
  courseImage:{
    type:String,
    max:50
  },
  courseVideo:{
    type:String,
    max:50
  }

  // Add more fields as needed  
});

const courses = mongoose.model('courses', CourseSchema);

module.exports = courses;
