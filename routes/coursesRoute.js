const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { TopicModel, CoursesModel, TopicMaterialModel } = require('../models');


router.get('/', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const courses = await CoursesModel.find();
      const coursesCount = await CoursesModel.countDocuments() + 1;
  
      // Get the user's progress  
      res.render('courses', { courses,coursesCount}); // Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).send('An error occurred while retrieving the courses.');
    }
  });

  router.get('/courses/usersCourse', (req, res) => {
    // Assuming you have the 'courses' data available
    const courses = req.body.courses;
  
    res.render('usersCourse', { courses });
  });  

  router.get('/courses', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const courses = await CoursesModel.find();
  
      // Get the user's progress
      res.json(courses);// Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).send('An error occurred while retrieving the courses.');
    }
  });
  router.get('/course-topics/:id', verifyToken.verifyToken, async (req, res) => {
    try {
      const courseId = req.params.id;

      // Find the topic by ID
      const topic = await TopicModel.find({courseId:courseId});
  
      if (!topic) {
        // If topic is not found, render an error page or redirect to an error route
        return res.render('error', { message: 'Topic not found' });
      }
  
      // Find the topic material by topicId
      const topicMaterial = await TopicMaterialModel.findOne({ topicId:topic._id });
  
      // if (!topicMaterial) {
      //   // If topic material is not found, render an error page or redirect to an error route
      //   return res.render('', { message: 'Topic material not found' });
      // }
  
      res.render('courseTopic', { topic,courseId }); // Render the edit topic page with the retrieved data// Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).send('An error occurred while retrieving the courses.');
    }
  });

  
  
// Create a course
router.post('/', verifyToken.verifyToken, async (req, res) => {
    try {
      const course = new CoursesModel({
        title: req.body.title,
        courseNo: req.body.courseNo,
        courseDesc: req.body.courseDesc,
        courseImage: req.body.courseImage,
        courseVideo: req.body.Video
      });
  
      const savedCourse = await course.save();
      // res.json(savedCourse);
      const courses = await CoursesModel.find();
      const coursesCount = await CoursesModel.countDocuments() + 1;
  
      // Get the user's progress  
      res.render('courses', { courses,coursesCount}); 
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).send('An error occurred while creating the course.');
    }
  });
  
  // Edit a course
  router.put('/:id', verifyToken.verifyToken, async (req, res) => {
    try {
      const course = await CoursesModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
      const courseId = req.params.id; 
     // const course = await Courses.findById(req.params.id);

      //before deleting all topics  get all the topic Id's and then get the all topicMaterial

        // Find the topic by ID and delete it
      await TopicModel.deleteMany({ courseId })

    // Delete the topic material associated with the topic
    await TopicMaterialModel.deleteMany({ topicId });
      if (!course) {
        return res.status(404).send('Course not found');
      }
      const course1 = await CoursesModel.findByIdAndDelete(req.params.id);
      res.json(course);
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).send('An error occurred while deleting the course.');
    }
  });

  module.exports = router;  