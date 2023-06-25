  const mongoose = require('mongoose');

  const userProgressSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true
    },
    progress: {
      type: Number,
      required: true,
      default: 0
    },
    completed:{
      type:Boolean,
      required:true,
      default:false
    }
  });

  const UserProgressModel = mongoose.model('UserProgress', userProgressSchema);

  module.exports = UserProgressModel;
