const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Courses = require('../models/coursesModel');


router.get('/', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const courses = await Courses.find();
  
      // Get the user's progress
      res.render('courses', { courses}); // Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).send('An error occurred while retrieving the courses.');
    }
  });

  
router.get('/courses', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const courses = await courses.find();
  
      // Get the user's progress
      res.json(courses);// Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).send('An error occurred while retrieving the courses.');
    }
  });

  
  
// Create a course
router.post('/', verifyToken.verifyToken, async (req, res) => {
    try {
      const course = new Courses({
        title: req.body.title,
        courseNo: req.body.courseNo,
        courseDesc: req.body.courseDesc,
        courseImage: req.body.courseImage,
        courseVideo: req.body.Video
      });
  
      const savedCourse = await course.save();
      res.json(savedCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).send('An error occurred while creating the course.');
    }
  });
  
  // Edit a course
  router.put('/:id', verifyToken.verifyToken, async (req, res) => {
    try {
      const course = await Courses.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!course) {
        return res.status(404).send('Course not found');
      }
      res.json(course);
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).send('An error occurred while updating the course.');
    }
  });
  
  // Delete a course
  router.delete('/:id', verifyToken.verifyToken, async (req, res) => {
    try {
      const course = await Courses.findByIdAndDelete(req.params.id);
      if (!course) {
        return res.status(404).send('Course not found');
      }
      res.json(course);
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).send('An error occurred while deleting the course.');
    }
  });

  module.exports = router;  