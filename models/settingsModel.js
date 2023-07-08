const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  logo: {
    type: String,

  },
  passPercentage:{
    type: Number,
    required:true
  },
  siteIntroDesc:{
    type:String,
  },
  user:{
    type:String,
    require:true
  },
  videoSource:[],

  // Add more fields as needed  
},
{ timestamps: true }  
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
