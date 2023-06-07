const express = require('express');
const router = express.Router();
const User = require('../models/users');
const utils = require('../utils/tokenUtil');

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = utils.generateAuthToken();

    // Create a cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    });

    // Redirect the user to the topics page
    res.redirect('/topics');
  } catch (err) {
    // Return the error messages to the login page
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

module.exports = router;
