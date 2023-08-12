const mongoose = require('mongoose');
const ActionsSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
      },  
    type: {
      type: String,
      required: true
    },
    data:{
        type:String,
        return:true,
    }
    // Add more fields as needed
  },
  { timestamps: true }  );
  
  const ActionsModel = mongoose.model('actions', ActionsSchema);
  
  module.exports = ActionsModel;