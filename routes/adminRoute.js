const express = require('express');
const router = express.Router();
const {verifyToken, isAdmin} = require('../middleware/verifyToken');
const { CourseModel, CategoryModel } = require('../models');
const { CoursesController } = require('../controllers');

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

router.get('/courses',verifyToken,isAdmin, async (req,res)=>{
  try {
    // Retrieve all topics from the database
    var coursesSearch = "";
    var allCourses = "";
    const searchQuery = req.query.search;
    const courses = await CourseModel.find();
    if( searchQuery && searchQuery.search("search")){
      console.log("search");
      coursesSearch = await CoursesController.courseSearch(req,res);
      console.log(coursesSearch);
    }
    const allQuery = req.query.allcourses;
    if( allQuery && req.query.allcourses.search("allcourses") ){
      console.log("all");
      allCourses = courses
    }
   
    const categories =  await CategoryModel.find();
    
    const coursesCount = await CourseModel.countDocuments() + 1;

    res.render('admin/adminCourses', { courses,coursesCount,coursesSearch,allCourses,categories}); // Pass the topics and progress data to the topics view for rendering
  } catch (error) { 
    console.error('Error retrieving Courses:', error);
    res.status(500).send('An error occurred while retrieving the Courses.');
  }
});

router.post('/category',verifyToken,isAdmin, async (req,res)=>{
  try {
    console.log(req.body);
    const createCategory = await CoursesController.createCategory(req.body.name);
    if(createCategory){
      res.json(createCategory );
    }else{
      res.json(createCategory );
    }    
  } catch (error) {
    
  }
});

router.post('/createCourse',verifyToken,isAdmin, async(req,res)=>{
  try {
    const createCourse = await CoursesController.createCourse(req);
    res.redirect('courses');
  } catch (error) {
    
  }

});


//router 



module.exports = router;    