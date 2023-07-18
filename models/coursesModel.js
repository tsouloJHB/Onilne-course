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
  active:{
    type:Boolean,
    default:false,
    required:true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courseCategory',
    required: true
  },
  courseImage:{
    type:String,
    max:50
  },
  courseVideo:{ 
    type:String,
    max:50
  },
  hours:{ 
    type:Number,
  },
  language:{ 
    type:String,
    default:"English"
  },
  difficulty:{
    type:String,
    default:"beginner"
  },
  prerequisites:{
    type:String,
  },
  material:{
    type:String,
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  ]

  // Add more fields as needed  
},
{ timestamps: true }  );

const CoursesModel = mongoose.model('courses', CourseSchema);

module.exports = CoursesModel;
