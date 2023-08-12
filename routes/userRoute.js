const express = require('express');
const router = express.Router();
const utils = require('../utils/tokenUtil');
const verifyToken = require('../middleware/verifyToken');
const { TopicModel,UserModel, CourseModel, CategoryModel, ActionsModel } = require('../models');
const { CoursesController, UserProgressController, UsersController, ActionsController } = require('../controllers');
const { redirect } = require('react-router-dom');
const { loginDataValidate, userDataValidateSchemaBased } = require("../validation/user.validation");
const { validationResult } = require("express-validator");
const nodemailer = require('nodemailer');
const {sendEmail} = require('../utils/emailer');
const crypto = require('crypto');
const {  signUpSchemaValidator } = require('../validation/user.validation');
const handleErrors = require('../utils/errors');
const { type } = require('os');


// Login route
router.post('/login', loginDataValidate,async (req, res) => {

  const { email, password ,course} = req.body;
  console.log(course);
  console.log("query");
  try {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {  
      console.log(errors.array());
      res.render('login', { errors: errors.array() });
    }
  
    const user = await UserModel.login(email, password);

    const token = utils.generateAuthToken(user._id); // Use the instance method to generate the token
    
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
   
    //await UsersController.sendEmail("thabangsoulo@gmail.com","Node mailer boi");
    if (user.isAdmin) {
      // Redirect the admin user to the admin page
     res.redirect('/admin');
    //  const courses =  await CourseModel.find();
    //   res.render('admin/admin',{courses});
    } else {
      const courses = await CoursesController.getUserCourses(user._id);
      // Redirect the non-admin user to the topics page

      //res.render('courses/userCourses', { courses });
      //check for user actions in the database
      console.log(user._id);
      const userActions = await ActionsController.onLoginCheckActions(user._id);
      if(course !== "" && course !== null){
        res.redirect(`/course/view/${course}`);
      }else{
        console.log(userActions);  
        if(userActions.status){
          if(userActions.type === "redirect"){
            
           return res.redirect(userActions.data);
          } 
        }
        res.redirect('/users');
      }
     
    }
  } catch (err) {
    // Return the error messages to the login page
    console.log(err);
    res.render('login', { errors: [{msg:"Incorrect email or password"}] });
  }
});


router.get('/login', (req, res) => {
  res.render('login');
});

// Signup route
router.post('/signup',loginDataValidate ,async (req, res) => {
  const { email, password, name, surname,confirmpassword,course } = req.body;
 
  try {
    // Check if the email already exists
    if (password == null || password == "" || name == "" || name == null || surname == "" || surname == null
        || email == "" || email == null
    ) {
      return res.status(400).json({ error: 'empty fields submitted' });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({ error: 'passwords do not match' });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
   
    // Inside the /signup route handler
    const newUser = new UserModel({ email, password, name, surname });

    // Generate verification token and save it to the user document
    const verificationToken = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const userResponse = await newUser.save();
     console.log(userResponse);
    //check and setup user actions
    if(course !== undefined && course != null){
      
      await ActionsController.setLoginActions("redirect",`/course/view-course/${course}`,userResponse._id);
    }
    
    // Generate the verification URL
    const restUrl = `${req.protocol}://${req.get('host')}/users/verify/${verificationToken}`;
      // Send verification email
    const message = `Thank you for signing up! Please click the following link to verify your account:\n\n ${restUrl}`;
    //const sendmail = await sendEmail(email, message, 'Account Verification');
    const sendmail = true;

    if (!sendmail) {
      // Handle email sending error
      return res.status(500).json({ error: 'Error sending verification email' });
    }
    // Generate JWT token
    const token = utils.generateAuthToken();

    // Create a cookie with the token
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    // });

    // Redirect the user to the topics page
    return res.status(201).json({ message: 'Account created please check your email to verify your account'});
   // res.redirect('/users');
  } catch (err) {
    // Return the error messages to the signup page
    const errors = handleErrors(err);
      
    console.log(errors);
    res.status(400).json({ error: err.message });
  }
});

router.get('/signout',(req,res) =>{
  res.clearCookie('connect.sid');
  res.clearCookie('token');

  res.redirect('/users/login');
});
router.get('/signup', (req, res) => {
  res.render('signup', { error: null }); // Pass 'error' as null initially
});

// Sign out route
// router.get('/signout', (req, res) => {
//   // Clear the token cookie
//   res.clearCookie('token');

//   // Redirect the user to the home page or any other desired page
//   res.redirect('/');
// });

router.get('/progress', verifyToken.verifyToken,async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user authentication middleware to populate req.user

    // Get the user's current topic number
    const user = await UserModel.findById(userId);
    const currentTopicNo = user.currentTopic;

    // Get the total number of topics
    const totalTopics = await TopicModel.countDocuments();

    // Calculate the user's progress percentage
    const progress = (currentTopicNo / totalTopics) * 100;

    res.json({ progress }); // Return the progress as JSON response
  } catch (error) {
    console.error('Error retrieving user progress:', error);
    res.status(500).json({ error: 'An error occurred while retrieving user progress.' });
  }
});

router.get('/',verifyToken.verifyToken,async (req, res) => {
  try {
  
    //get trending courses  
    const userId = req.user._id;
    const topCourses = await CoursesController.getTopFiveCourses(userId);
    const courses = await CoursesController.getUserCourses(userId,true);
    const usersProgress = await UserProgressController.getUserProgress(userId);
    //console.log(topCourses);
    //get course categories
    const categories = await CategoryModel.find().sort({ name: 1 });
    res.render('users/usersHome',{courses,topCourses,usersProgress,categories});
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});


router.get('/settings',verifyToken.verifyToken,async (req, res) => {
  try {
  
    //get trending courses  
    let errors = [];
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    if(errorMessage !== ""){
      errors = [
        {
          type: 'field',
          value: '',
          msg: errorMessage,
          path: 'password',
          location: 'body'
        }
      ]
    }

    return await UsersController.renderSettingsPage(req,res,errors);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// change password
router.post('/changepassword',verifyToken.verifyToken, async (req, res) => {

  try {
    
    return await UsersController.changePassword(req,res);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post('/changename',verifyToken.verifyToken, async (req, res) => {

  try {
    
    return await UsersController.changeDisplayName(req,res);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
router.get('/verify/:token', UsersController.verifyAccount);

router.get('/resetpassword/:token',UsersController.resetPasswordRender);
router.get('/forgotpassword',UsersController.forgotPasswordRender);
router.post('/forgotpassword',UsersController.forgotPassword);
router.post('/resetpassword/:token',UsersController.changeForgotPassword);


module.exports = router;



