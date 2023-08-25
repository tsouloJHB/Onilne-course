const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { UserProgressModel,TopicModel,CourseModel, TopicMaterialModel, CategoryModel } = require('../models');
const { CoursesController, TopicsController } = require('../controllers');
const { upload } = require('../middleware/upload');
const { courseDataValidate, courseEditDataValidate } = require('../validation/courseValidation');
const { validationResult } = require("express-validator");
const { default: mongoose } = require('mongoose');
const {verifyLogin} = require('../middleware/verifyToken');


// router.get('/', verifyToken.verifyToken, async (req, res) => {
//     try {
     
    
//       // Retrieve all courses from the database
//       const courses = await CourseModel.find({active:true});
//       const coursesCount = await CourseModel.countDocuments() + 1;
     
//       // Get the user's progress  
     
//       res.render('courses', { courses,coursesCount}); // Pass the courses and progress data to the courses view for rendering
//     } catch (error) {
//       console.error('Error retrieving courses:', error);
//       return res.render('404',{message:"An error occurred while retrieving"});
//     }
//   });

router.get('/courses',verifyLogin, async (req, res) => {
  try {
   
  
    // Retrieve all courses from the database
    const courses = await CourseModel.find({active:true});
    const coursesCount = await CourseModel.countDocuments() + 1;
   
    // Get the user's progress  
   
    res.render('frontend/course', { courses,coursesCount}); // Pass the courses and progress data to the courses view for rendering
  } catch (error) {
    console.error('Error retrieving courses:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});

router.get('/user',verifyToken.verifyToken, async(req, res) => {
    try {
    
      const courses = await CoursesController.getUserCourses(req.user._id);
      //get user stats
      const userProgress = await UserProgressModel.find({ user: req.user._id });

      const uniqueCourses = [...new Set(userProgress.map(item => item.course.toString()))];
      const completedCourseCount = userProgress.filter(item => item.completed).length;
     
      const userStats = {
        coursesCompleted: completedCourseCount,
        registeredCourses: uniqueCourses.length,
        inprogress: uniqueCourses.length - completedCourseCount  
      };
      

  
      delete req.user.password;
      return res.render('courses/userCourses',{courses,userStats,user:req.user});
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

  router.get('/create', verifyToken.verifyToken, async (req, res) => {
    try {
      // Retrieve all courses from the database
      const categories = await CategoryModel.find().sort({ name: 1 });
      const coursesCount = await CourseModel.countDocuments();
      const response = {
        message: req.session.successMessage,
        
      }
      const errors =  req.session.errors ? req.session.errors.errors:[];
      console.log(errors.msg);
      const admin  = req.user.isAdmin;
      // Clear the session variable to avoid displaying it on subsequent requests
      req.session.successMessage = null;
      req.session.errors = null;
      return res.render('courses/create',{categories,coursesCount,response,admin,errors});
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
      const coursesCount = await CourseModel.countDocuments({user:req.user._id});
      const coursesActive = await CourseModel.countDocuments({user:req.user._id,active:true});
      const coursesWithData = await CoursesController.coursesWithData(courses);

      const activeCourseCount = coursesWithData.filter(course => course.active).length;
      // Calculate the overall user count
      const overallUserCount = coursesWithData.reduce((count, course) => count + course.usersCount, 0);
      const stats = {
        activeCourseCount:activeCourseCount,
        overallUserCount:overallUserCount,
        coursesCount:coursesCount
      }
     return res.render('courses',{courses:coursesWithData,stats});
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
      //get course 
      const course = await CourseModel.findById(courseId);
      const students = await UserProgressModel.countDocuments({course:courseId});
      const admin  = req.user.isAdmin;
      const stats = {
        students:students,
        lessons:topic.length
      }
      res.render('courseTopic', { topic,courseId ,admin,courseActive,course,stats}); // Render the edit topic page with the retrieved data// Pass the courses and progress data to the courses view for rendering
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
      const categories =  await CategoryModel.find();
      //filter by rating
      if (req.query.rating && !isNaN(req.query.rating)) {
        const ratingFilter = parseInt(req.query.rating);
                                     
        const filteredCourses = await CourseModel.aggregate([
          {
            $match: {
              _id: { $in: courses.map((course) => course._id) }, // Filter only the received courses
              ratings: { $elemMatch: { rating: ratingFilter } }, // Filter courses with matching ratings
            },
          },
          {
            $addFields: {
              // Calculate average rating for each course
              averageRating: { $avg: '$ratings.rating' },
            },
          },
          {
            $sort: { averageRating: -1 }, // Sort by average rating in descending order
          },
        ]);
       
   
        return res.render('search', { courses: filteredCourses,categories});
      }

      
      res.render('search',{courses,categories});
  } catch (error) {
    console.log(error);
  }  
});

router.get('/search-h', async (req, res) => {
  try {
      if(req.query.search == null || req.query.search == ""){
        res.redirect(req.headers.referer);
      }
 
      req.user = {
        _id : new mongoose.mongo.ObjectId(),
      }
     
  
      const courses = await CoursesController.courseSearch(req,res);
      const categories =  await CategoryModel.find();
      //filter by rating
      
      if (req.query.rating && !isNaN(req.query.rating)) {
        const ratingFilter = parseInt(req.query.rating);
                                     
        const filteredCourses = await CourseModel.aggregate([
          {
            $match: {
              _id: { $in: courses.map((course) => course._id) }, // Filter only the received courses
              ratings: { $elemMatch: { rating: ratingFilter } }, // Filter courses with matching ratings
            },
          },
          {
            $addFields: {
              // Calculate average rating for each course
              averageRating: { $avg: '$ratings.rating' },
            },
          },
          {
            $sort: { averageRating: -1 }, // Sort by average rating in descending order
          },
        ]);
       
   
        return res.render('search', { courses: filteredCourses,categories,unAuthenticated:true});
      }

      
      res.render('search',{courses,categories,unAuthenticated:true});
  } catch (error) {
    console.log(error);
  }  
});


router.get('/search-suggest', async (req, res) => {
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
    let countTopics = await TopicModel.countDocuments({courseId:course._id});
    if(!course){
      return res.render('404'); 
    }
    const userProgress = await UserProgressModel.findOne({user:req.user._id,course:course._id});
    courseCreator = await CoursesController.getCourseCreator(course._id);
    userCount = await CoursesController.countCourseRegisteredUser(course._id);
    const rating = await CoursesController.getAverageRating(course.ratings);
    if(userProgress){
      const updatedCourse = modifiedCourse = {
        ...course.toObject(), // Spread the properties of the course object
        registered:true,
        completed:userProgress.completed,
        topics:countTopics,
        creator:courseCreator,
        userCount:userCount,
        ratingsAverage:rating
    
         // Add the progress field
      };
 
      return res.render('courses/viewCourse',{course:updatedCourse});
    }

    let owner = false;
   // console.log(course.user);
    //console.log(req.user._id);
    if(req.user._id.toString() == course.user.toString()){
      owner = true;
    }

    const updatedCourse = {
      ...course.toObject(), // Spread the properties of the course object
      owner:owner,
      topics:countTopics,
      creator:courseCreator.user,
      userCount:userCount,
      ratingsAverage:rating
       // Add the progress field
    };
    console.log(rating);
    //console.log(updatedCourse);
    
    res.render('courses/viewCourse',{course:updatedCourse});
  } catch (error) {
    res.render('404');
    console.log(error);
  }  
});




  
// Create a course
router.post('/create',verifyToken.verifyToken,upload , courseDataValidate,async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Render the courses page with errors
        console.log(errors.array());
        req.session.errors = errors;
       
        res.redirect(req.headers.referer);
        //await CoursesController.renderCourseCreatedPage(req, res, errors.array());
      } else {
        const createCourse = await CoursesController.createCourse(req);
        // Handle course creation and redirection
        req.session.successMessage = createCourse.course;
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
     
      const categories = await CategoryModel.find().sort({ name: 1 });
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

router.get('/view-course/:id',CoursesController.viewCourseUnAuthenticated);
router.post('/ratings', verifyToken.verifyToken,CoursesController.saveRating);
router.post('/category',CoursesController.getCourseByCategory);
router.get('/best-courses' ,CoursesController.bestCourses);
module.exports = router;  