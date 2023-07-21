const User = require('../models/usersModel');
const Topic = require('../models/topicModel');
const { UserModel } = require('../models');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require('crypto');



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

module.exports.sendEmail = async (to,message,subject)=>{
  try{  
    const password = "dnmwpflioeendxiz";
    const email = "0784939@gmail.com"
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
      port: 465, // Port for SMTP (usually 465)
      secure: true, // Usually true if connecting to port 465
      auth: {
        user: email, // Your email address
        pass: password, // Password (for gmail, your app password)
        // ⚠️ For better security, use environment variables set on the server for these values when deploying
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

      // Define and send message inside transporter.sendEmail() and await info about send from promise:
  let info = await transporter.sendMail({
    from: email,
    to: to,
    subject: subject,
    html: `
    <h1>Hello there</h1>
    <p>${message}</p>
    `,
  });

  console.log(info.messageId); 
  return true;
  }catch(error){
    return false;
    console.log(error);
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

module.exports.forgotPassword = async (req,res) =>{

  try {
    // 1. Find the user by their email
    
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      // User with the provided email does not exist
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Generate the reset token and save it in the database
    const resetToken = user.createResetPasswordToken();
    await user.save();
    const restUrl = `${req.protocol}://${req.get('host')}/users/resetpassword/${resetToken}`;
  
    console.log(restUrl);
    //send email
    const message = `Here is a link to reset your password \n\n${restUrl}`;
    const sendEmail =  await this.sendEmail(req.body.email,message,"Reset Password");
    if(!sendEmail){
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      user.save({validateBeforeSave:false});
    }
    // 4. Return a success response
    return res.status(200).json({ message: 'Password reset token sent to the user' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error sending reset password token' });
  }  

}

//Change password for forgot password 
module.exports.changeForgotPassword =  async (req, res) => {
  try {
    const token =  crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await UserModel.findOne({passwordResetToken:token,passwordResetTokenExpires:{$gt: Date.now()}});
  
    if(!user){
      console.log("Invalid token");
      return res.status(404).json({ error: 'User not found' });
  
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    user.save();
  
    //login user automatically 
    req.session.user = {
      id: user._id,
      admin: user.isAdmin,
      // other user properties
    };
    req.session.cookie.token = user._id
    req.sessionID = token;
    // Create a cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    });
    res.redirect('/admin');
  } catch (error) {
    console.log(error);
  
  }
}

module.exports.resetPasswordRender = async (req,res) =>{
  try {
    console.log(req.params);
    const token =  crypto.createHash('sha256').update(req.params.token).digest('hex');
 
    const user = await UserModel.findOne({passwordResetToken:token,passwordResetTokenExpires:{$gt: Date.now()}});
  
    if(!user){
      console.log("Invalid token");
      return res.status(404).json({ error: 'User not found' });
  
    }
    return res.render("users/resetPassword");
    
  
  } catch (error) {
    
  }
}

 