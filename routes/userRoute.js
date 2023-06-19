const express = require('express');
const router = express.Router();
const utils = require('../utils/tokenUtil');
const verifyToken = require('../middleware/verifyToken');
const { TopicModel,UserModel, CourseModel } = require('../models');
const { CoursesController } = require('../controllers');

// Login route
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  try {
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
      res.render('courses/userCourses', { courses });

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
    await newUser.save();

    // Generate JWT token
    const token = utils.generateAuthToken();

    // Create a cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    });

    // Redirect the user to the topics page
    res.redirect('/topics');
  } catch (err) {
    // Return the error messages to the signup page
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});
router.get('/signup', (req, res) => {
  res.render('signup', { error: null }); // Pass 'error' as null initially
});

// Sign out route
router.get('/signout', (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  // Redirect the user to the home page or any other desired page
  res.redirect('/');
});

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

module.exports = router;
