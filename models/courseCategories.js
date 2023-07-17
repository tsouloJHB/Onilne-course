const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    }
    // Add more fields as needed
  },
  { timestamps: true }  );
  
  const CategoryModel = mongoose.model('courseCategory', CategorySchema);
  
  module.exports = CategoryModel;