
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Topic = require('../models/topic');
const Courses = require('../models/coursesModel');

// Protected route using verifyToken middleware
router.get('/', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all topics from the database
      const courses = await Courses.find();
      const coursesCount = await Courses.countDocuments() + 1;
  
      res.render('admin', { courses,coursesCount}); // Pass the topics and progress data to the topics view for rendering
    } catch (error) {
      console.error('Error retrieving topics:', error);
      res.status(500).send('An error occurred while retrieving the topics.');
    }
  });