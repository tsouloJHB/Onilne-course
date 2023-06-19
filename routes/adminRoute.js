const express = require('express');
const router = express.Router();
const {verifyToken, isAdmin} = require('../middleware/verifyToken');
const { CourseModel } = require('../models');

// Protected route using verifyToken middleware
router.get('/', verifyToken,isAdmin, async (req, res) => {
    try {
      // Retrieve all topics from the database
      const { user } = req.session;
      const courses = await CourseModel.find();
      const coursesCount = await CourseModel.countDocuments() + 1;
      if(!courses){
        
      }
      console.log("Passing bay");
      console.log(courses);
      console.log(req.cookies);
      res.render('admin/admin', { courses,coursesCount}); // Pass the topics and progress data to the topics view for rendering
    } catch (error) { 
      console.error('Error retrieving Courses:', error);
      res.status(500).send('An error occurred while retrieving the Courses.');
    }
});
  module.exports = router;  