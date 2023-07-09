const User = require('../models/usersModel');
const Topic = require('../models/topicModel');
const { UserModel } = require('../models');
const bcrypt = require('bcrypt');


module.exports.renderSettingsPage = async (req, res,errors) => {
  try {
    // Retrieve all courses from the database
   
    const user = await UserModel.findById(req.user.id);
    const { password, isAdmin,createdAt,updatedAt,__v, ...other } = user._doc;

    return res.render('users/settings', { user ,errors});
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.render('404', { message: "An error occurred while retrieving" });
  }
}

module.exports.changePassword =  async (req, res) => {
  try {
    // Retrieve all courses from the database
    let errors = [];
    const {password,newPassword} = req.body;
    //validation
    if(password == null || newPassword == null || 
      password == undefined || newPassword == undefined ||
      password == "" || newPassword == ""){
      errors = [
        {
          type: 'field',
          value: '',
          msg: 'Missing fields',
          path: 'password',
          location: 'body'
        }
      ]
      req.flash('error', 'Missing fields');
      res.redirect('/users/settings');
     // return await this.renderSettingsPage(req,res,errors);
    }
    //check is password is correct 
   
    const checkPassword = await UserModel.login(req.user.email,password);
    if(!checkPassword){
       errors = [
        {
          type: 'field',  
          value: '',
          msg: 'Incorrect Password',
          path: 'password',
          location: 'body'
        }
      ]
      console.log("incorrect pass");
      req.flash('error', 'Incorrect Password');
     return res.redirect('/users/settings');
      //return await this.renderSettingsPage(req,res,errors);
    }
    console.log("never");
    //set new password
    //had password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    

  
    const savePassword = await UserModel.findByIdAndUpdate(req.user._id,{password:hashedPassword});
    if(!savePassword){
      errors = [
        {
          type: 'field',
          value: '',
          msg: 'Unable to save password Password',
          path: 'password',
          location: 'body'
        }
      ]
     
      //return await this.renderSettingsPage(req,res,errors);
    }
    errors = [
      {
        type: 'field',
        value: '',
        msg: 'Password successfully saved',
        path: 'password',
        location: 'body'
      }
    ]
    req.flash('error', 'Password successfully changed');
   return  res.redirect('/users/settings');
   // return await this.renderSettingsPage(req,res,errors);
  } catch (error) {
    if(error.message === "Incorrect password"){
      errors = [
        {
          type: 'field',  
          value: '',
          msg: 'Incorrect Password',
          path: 'password',
          location: 'body'
        }
      ]
      console.log("incorrect pass");
     req.flash('error', 'Incorrect Password');
     return res.redirect('/users/settings');
    }
    console.error('Error retrieving user:', error);
    return res.render('404', { message: "An error occurred while retrieving" });
  }

  
}

module.exports.changeDisplayName = async(req,res) =>{
  try {
      const {name} = req.body;
      if(name == null || name == "" || 
        name == undefined ){
        errors = [
          {
            type: 'field',
            value: '',
            msg: 'Missing fields',
            path: 'password',
            location: 'body'
          }
        ]
        return await this.renderSettingsPage(req,res,errors);
      }
      const updateDisplayName  = await UserModel.findByIdAndUpdate(req.user._id,{name});
      if(!updateDisplayName){
        errors = [
          {
            type: 'field',
            value: '',
            msg: 'There was a problem saving the name',
            path: 'password',
            location: 'body'
          }
        ]
        return await this.renderSettingsPage(req,res,errors);
      }
      errors = [
        {
          type: 'field',
          value: '',
          msg: 'Name successfully saved',
          path: 'password',
          location: 'body'
        }
      ]
      return await this.renderSettingsPage(req,res,errors);
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.render('404', { message: "An error occurred while retrieving" });
  }
}


module.exports.getUserProgress = async (userId) => {
  try {
    // Get the user's current topic number
    const user = await User.findById(userId);
    const currentTopicNo = user.currentTopic;

    // Get the total number of topics
    const totalTopics = await Topic.countDocuments();

    // Calculate the user's progress percentage
    const progress = (currentTopicNo / totalTopics) * 100;

    return progress;
  } catch (error) {
    console.error('Error retrieving user progress:', error);
    throw new Error('An error occurred while retrieving user progress.');
  }
};

