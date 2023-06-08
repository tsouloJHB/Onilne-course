const express = require('express');
const router = express.Router();
const User = require('../models/users');
const utils = require('../utils/tokenUtil');
const verifyToken = require('../middleware/verifyToken');
const Topic = require('../models/topic');

// Login route
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = utils.generateAuthToken(user._id); // Use the instance method to generate the token
  
    // Create a cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    });

    if (user.isAdmin) {
      // Redirect the admin user to the admin page
      res.redirect('/admin');
    } else {
      // Redirect the non-admin user to the topics page
      res.redirect('/topics');
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create a new user
    const newUser = new User({ email, password, name, surname });
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
    const user = await User.findById(userId);
    const currentTopicNo = user.currentTopic;

    // Get the total number of topics
    const totalTopics = await Topic.countDocuments();

    // Calculate the user's progress percentage
    const progress = (currentTopicNo / totalTopics) * 100;

    res.json({ progress }); // Return the progress as JSON response
  } catch (error) {
    console.error('Error retrieving user progress:', error);
    res.status(500).json({ error: 'An error occurred while retrieving user progress.' });
  }
});

module.exports = router;
