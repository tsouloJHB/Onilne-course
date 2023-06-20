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
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  courseDesc:{
    type:String,
    required:true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true
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

const CoursesModel = mongoose.model('courses', CourseSchema);

module.exports = CoursesModel;
