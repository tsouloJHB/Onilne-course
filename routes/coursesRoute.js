const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { UserProgressModel,TopicModel,CourseModel, TopicMaterialModel, CategoryModel } = require('../models');
const { CoursesController, TopicsController } = require('../controllers');
const { upload } = require('../middleware/upload');
const { courseDataValidate, courseEditDataValidate } = require('../validation/courseValidation');
const { validationResult } = require("express-validator");


router.get('/', verifyToken.verifyToken, async (req, res) => {
    try {
     
    
      // Retrieve all courses from the database
      const courses = await CourseModel.find({active:true});
      const coursesCount = await CourseModel.countDocuments() + 1;
     
      // Get the user's progress  
     
      res.render('courses', { courses,coursesCount}); // Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });

router.get('/user',verifyToken.verifyToken, async(req, res) => {
    try {
      const courses = await CoursesController.getUserCourses(req.user._id);
      // console.log(courses.length);
      //console.log(courses);
      return res.render('courses/userCourses',{courses});
    } catch (error) {
      return res.render('404',{message:"An error occurred while retrieving"});
    }
    // Assuming you have the 'courses' data available

   
  });  

  router.get('/courses', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const courses = await CourseModel.find({active:true});
  
      // Get the user's progress
      res.json(courses);// Pass the courses and progress data to the courses view for rendering
    } catch (error) { 
      console.error('Error retrieving courses:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });
  router.get('/created', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const categories =  await CategoryModel.find();
                

      const courses = await CourseModel.find({user:req.user._id});
      const coursesCount = await CourseModel.countDocuments();
      const coursesWithData = await CoursesController.coursesWithData(courses);
      res.render('courses',{courses:coursesWithData,coursesCount,categories});
    } catch (error) { 
      console.error('Error retrieving courses:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });
  router.get('/course-topics/:id', verifyToken.verifyToken, async (req, res) => {
    try {
      const courseId = req.params.id;
      //check if user is Authorization
      await CoursesController.courseUserAuthorized(req.user._id,courseId,res,req); 
      //check if course active 
      const courseActive = await CoursesController.checkCourseActive(courseId,res);
     
      // Find the topic by ID
      const topic = await TopicModel.find({courseId:courseId});
  
      if (!topic) {
        // If topic is not found, render an error page or redirect to an error route
        return res.render('error', { message: 'Topic not found' });
      }
  
      // Find the topic material by topicId
      //const topicMaterial = await TopicMaterialModel.findOne({ topicId:topic._id });
  
      // if (!topicMaterial) {
      //   // If topic material is not found, render an error page or redirect to an error route
      //   return res.render('', { message: 'Topic material not found' });
      // }
      const admin  = req.user.isAdmin;
      res.render('courseTopic', { topic,courseId ,admin,courseActive}); // Render the edit topic page with the retrieved data// Pass the courses and progress data to the courses view for rendering
    } catch (error) {
      console.error('Error retrieving courses:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });

router.get('/search', verifyToken.verifyToken, async (req, res) => {
  try {
      if(req.query.search == null || req.query.search == ""){
        res.redirect(req.headers.referer);
      }
      
      const courses = await CoursesController.courseSearch(req,res);
  

      res.render('search',{courses});
  } catch (error) {
    console.log(error);
  }  
});

router.get('/search-suggest', verifyToken.verifyToken, async (req, res) => {
  try {
      if(req.query.search == null || req.query.search == ""){
       // res.redirect(req.headers.referer);
      }
      const courses = await CoursesController.courseSuggestionSearch(req,res);
      
      res.status(201).json({search:courses});
  } catch (error) {
    console.log(error);
  }  
});

router.get('/view/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    console.log("users here");
    const course = await CourseModel.findById(req.params.id);
    if(!course){
      return res.render('courses/viewCourse',{course:{}}); 
    }
    const userProgress = await UserProgressModel.findOne({user:req.user._id,course:course._id});
 
    if(userProgress){
      const updatedCourse = modifiedCourse = {
        ...course.toObject(), // Spread the properties of the course object
        registered:true,
        completed:userProgress.completed,
         // Add the progress field
      };
      console.log(updatedCourse);
      return res.render('courses/viewCourse',{course:updatedCourse});
    }

    let owner = false;
    console.log(course.user);
    console.log(req.user._id);
    if(req.user._id.toString() == course.user.toString()){
      owner = true;
    }

    const updatedCourse = {
      ...course.toObject(), // Spread the properties of the course object
      owner:owner
       // Add the progress field
    };
    console.log(updatedCourse);
    
    res.render('courses/viewCourse',{course:updatedCourse});
  } catch (error) {
    res.render('404');
    console.log(error);
  }  
});


  
// Create a course
router.post('/created',verifyToken.verifyToken,upload , courseDataValidate,async (req, res) => {
    try {
      console.log(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Render the courses page with errors
        console.log(errors.array());
         await CoursesController.renderCourseCreatedPage(req, res, errors.array());
      } else {
        const createCourse = await CoursesController.createCourse(req);
        // Handle course creation and redirection
        res.redirect(req.headers.referer);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });

  router.put('/activate',verifyToken.verifyToken,async (req,res)=>{
    try {
      const courseId = req.body.courseId;
      console.log(courseId);
  
      await CoursesController.courseUserAuthorized(req.user._id,courseId,res,req);
      const activate = await CoursesController.activateCourse(courseId);
      console.log(activate);
      if(!activate){
        return res.status(401).json("Failed to activate course");
      }
      res.status(201).json("success");
      // res.redirect('/course/course-topics/'+courseId);
    } catch (error) {
      console.log(error);
      return res.status(500).json("An error occurred");
    }
  });
  router.put('/image', verifyToken.verifyToken,upload, async (req, res) => {
    // console.log('Arrived');
    // console.log( req.body);
    // return res.status(201).json("ARRIVED") 
    try {
      if(req.body.courseId == null || req.body.courseId == ""){
        const errors = [
          {
            type: 'field',
            value: '',
            msg: 'Missing courseId',
            path: 'title',
            location: 'body'
          }
        ]
        return res.status(401).json(errors);
      }
      return await CoursesController.updateCourseImage(req,res);  
    } catch (error) {
       console.log(error);
       return res.status(500).json({error}) 
    }

  });
  // Edit a course
  router.put('/:id', verifyToken.verifyToken,courseEditDataValidate, async (req, res) => {
    try {
      await CoursesController.courseUserAuthorized(req.user._id,req.params.id,res,req);
      //validate data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
       
        return res.status(400).json({errors: errors.array()});
      }

      const updateCourse = await CoursesController.updateCourse(req);
      if(updateCourse.success == false){
     
        return res.status(updateCourse.code).json(updateCourse.message);
      }
      // return res.redirect('/courses');
      res.status(201).json(updateCourse);
    } catch (error) {
      console.error('Error updating course:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });

   

 
  router.get('/edit/:id', verifyToken.verifyToken, async (req, res) => {
    try {
      await CoursesController.courseUserAuthorized(req.user._id,req.params.id,res,req);
      const course =  await  CourseModel.findById(req.params.id);
      // if(createCourse){
      //   res.redirect
      // }
      
      const admin  = req.user.isAdmin;
     
      const categories =  await CategoryModel.find();
      const userCategory = await CategoryModel.findById(course.category);
      res.render('courses/editCourse',{course,admin,categories,userCategory});
    } catch (error) {
      console.error('Error creating course:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });
  
  // Delete a course
  router.delete('/:id', verifyToken.verifyToken, async (req, res) => {
    try {
     
      const courseId = req.params.id; 
      await CoursesController.courseUserAuthorized(req.user._id,courseId,res,req); 
      const deleteCourse = await CoursesController.deleteCourse(courseId,res);
      if(!deleteCourse ){
        return res.status(401).json("Course not deleted");
      }
      return res.status(201).json("Course Deleted");
    } catch (error) {
      console.error('Error deleting course:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });

  router.post('/register', verifyToken.verifyToken, async (req, res) => {
    try {
      const { courseId } = req.body;
      //check if the user is registering for their own course
      const userCourse = await CourseModel.find({user:req.user._id,_id:courseId});
      if(userCourse.length > 0){
        return res.redirect('/users');
      }
      const topic  = await TopicModel.findOne({topicNo:1,courseId});
      console.log(req.body);

      const createProgress = new UserProgressModel({
        user:req.user.id,
        course:courseId,
        topic:topic._id,
        progress:1,
        completed:false   
      });
      await createProgress.save();
      //update course module
      // await CourseModel.findByIdAndUpdate(
      //   courseId,
      //   {$inc:{numberField:1}}
      // );
   
      res.redirect('/course/user');
    } catch (error) {
      console.error('Error updating course:', error);
      return res.render('404',{message:"An error occurred while retrieving"});
    }
  });

  module.exports = router;  