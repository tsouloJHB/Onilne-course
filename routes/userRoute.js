const express = require('express');
const router = express.Router();
const utils = require('../utils/tokenUtil');
const verifyToken = require('../middleware/verifyToken');
const { TopicModel,UserModel, CourseModel } = require('../models');
const { CoursesController, UserProgressController, UsersController } = require('../controllers');
const { redirect } = require('react-router-dom');
const { loginDataValidate, userDataValidateSchemaBased } = require("../validation/user.validation");
const { validationResult } = require("express-validator");
// Login route
router.post('/login', loginDataValidate,async (req, res) => {

  const { email, password } = req.body;

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
    console.log(req.session);
    if (user.isAdmin) {
      // Redirect the admin user to the admin page
     res.redirect('/admin');
    //  const courses =  await CourseModel.find();
    //   res.render('admin/admin',{courses});
    } else {
      const courses = await CoursesController.getUserCourses(user._id);
      // Redirect the non-admin user to the topics page
      console.log(courses);
      //res.render('courses/userCourses', { courses });
      res.redirect('/users');
    }
  } catch (err) {
    // Return the error messages to the login page
    console.log(err);
    res.render('login', { error: err.message });
  }
});


router.get('/login', (req, res) => {
  res.render('login');
});

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, name, surname } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create a new user
    
    const newUser = new UserModel({ email, password, name, surname });
    //generate user progress module 
    await newUser.save();

    // Generate JWT token
    const token = utils.generateAuthToken();

    // Create a cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    });

    // Redirect the user to the topics page
    res.redirect('/course');
  } catch (err) {
    // Return the error messages to the signup page
    console.log(err);
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
    res.render('users/usersHome',{courses,topCourses,usersProgress});
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


module.exports = router;
