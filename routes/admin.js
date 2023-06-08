
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Topic = require('../models/topic');
const Courses = require('../models/coursesModel');

const TopicMaterial = require('../models/topicMaterial');
// Protected route using verifyToken middleware
router.get('/', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all topics from the database
      const courses = await Courses.find();
  
      res.render('admin', { courses}); // Pass the topics and progress data to the topics view for rendering
    } catch (error) {
      console.error('Error retrieving topics:', error);
      res.status(500).send('An error occurred while retrieving the topics.');
    }
  });