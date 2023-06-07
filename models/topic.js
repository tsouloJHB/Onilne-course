const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  topicNo:{
    type: Number,
    required:true
  },
  topicDesc:{
    type:String,
    required:true
  },

  // Add more fields as needed  
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
