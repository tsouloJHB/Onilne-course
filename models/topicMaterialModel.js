const mongoose = require('mongoose');

const topicMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  topicVideo:{
    type:String,
    required:false
  },
  // Add more fields as needed
},
{ timestamps: true }  
);

const TopicMaterial = mongoose.model('TopicMaterial', topicMaterialSchema);

module.exports = TopicMaterial;
