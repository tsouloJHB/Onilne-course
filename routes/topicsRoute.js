const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { TopicModel, TopicMaterialModel,TopicQuizModel, SettingsModel, CourseModel, CategoryModel } = require('../models');
const {CoursesController,TopicsController ,UserProgressController, QuizController} = require('../controllers');
const { topicCreateDataValidate } = require('../validation/topicValidation');
const { validationResult } = require('express-validator');
const { quizCreateDataValidate } = require('../validation/quizValidation');
const { validateCreateQuiz } = require('../validation/customValidation');
const Topic = require('../models/topicModel');
const { compare } = require('bcrypt');

// Protected route using verifyToken middleware
router.get('/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id
    //check if the user is registered for the course
    if(req.params.id == null || req.params.id == undefined || req.params.id == ""){
      return res.render('404');
    }

    const courseChecker = await CoursesController.checkIfUserIsRegisteredForCourse(req.user._id,courseId,req,res);

    if(courseChecker == undefined){
      return courseChecker;
    }
    // Retrieve all topics from the database
    
    const topics = await TopicsController.getUserTopics(courseId);

    // Get the user's progress
   
   // const progress = await UsersController.getUserProgress(req.user._id);
    const progress = await UserProgressController.getUserProgress(courseId,req.user._id);
    let currentTopic = "";

  
    if(progress != null){
      currentTopic = progress.progress;
    }else{
      currentTopic = req.user.isAdmin == true ? 100 : 0;
    }
    const downloadCertificate = await CoursesController.checkCourseComplete(courseId,req.user._id);

    const course = await CourseModel.findById(courseId);
    let countTopics = await TopicModel.countDocuments({courseId:course._id});
    console.log("countTopics "+ countTopics + "current topic " + progress.progress);
    //const percentage =  (progress.progress/countTopics) * 100;
    let percentage =  progress.progress == 1 && countTopics == 1  || progress.progress == 0 ? 0: (progress.progress/countTopics) * 100;
    //get the category fo the course
    const category = await CategoryModel.findById(course.category);

    //get remaining hours 
    const hours = course.hours ? course.hours : 0;
    console.log("hours "+ hours+" percentage "+percentage);
    let remainingHours = (hours * (100 - percentage) / 100).toFixed(0);
    const ratings = await CoursesController.hasUserRatedCourse(req.user._id,courseId);
    //remainingHours = progress.completed ? 0:remainingHours;
     modifiedCourse = {
      ...course.toObject(), // Spread the properties of the course object
      progress: progress.progress,
      completed:progress.completed,
      percentage:percentage.toFixed(0), // Add the progress field
      categoryName:category.name,
      remainingHours:remainingHours,
      topics:countTopics,
      ratings:ratings
    };

    res.render('topics', { topics,currentTopic,courseId,downloadCertificate,course:modifiedCourse }); // Pass the topics and progress data to the topics view for rendering
  } catch (error) {
    console.error('Error retrieving topics:', error);
    return res.render('404',{message:"An error occurred while retrieving"});

  }
});




router.get('/create/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    await CoursesController.courseUserAuthorized(req.user._id,courseId,res,req); 
    //get the video sources
    const videoSource = await SettingsModel.findOne();
    // Route handling code for topics page
  
    res.render('createTopic',{courseId,videoSource:videoSource.videoSource});
  } catch (error) {
    console.error('Error:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }

});  

router.post('/create/:id', verifyToken.verifyToken,topicCreateDataValidate,async (req, res) => {
  try {
    // const topicNo = req.body.topicNo;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.headers.referer);
      const link = req.headers.referer.toString().split("/");
      const courseId = link[link.length-1];
      //console.log(link[link.length-1]);
      //render the create topic page with error 
      
      return await TopicsController.renderCreateTopic(courseId,req.user.id,req,res,errors.array()  );
      //return res.status(400).json({errors: errors.array()});
    }
    const courseId = req.body.courseId;
    await CoursesController.courseUserAuthorized(req.user._id,courseId,res,req); 
    // Check if topic number already exists
    // const existingTopic = await TopicModel.findOne({ topicNo,courseId:req.body.courseId });
    const countTopics = await TopicModel.countDocuments({courseId:req.body.courseId}) +1 ;

    // if (existingTopic) {
    //   // If topic number already exists, render the createTopics page with an error message
    //   return res.render('createTopic', { error: 'Topic number already exists. Consider updating the topic instead.' ,topicsCount:topicNo,courseId});
    // }

    // Create a new topic
    const topic = new TopicModel({
      title: req.body.topicTitle,
      topicNo: countTopics,
      topicDesc: req.body.topicDesc,
      courseId:req.body.courseId,
     
      
    });

    // Save the topic to the database
    const savedTopic = await topic.save();

    // Create a new topic material
    const topicMaterial = new TopicMaterialModel({
      title: req.body.topicTitle,
      content: req.body.materialContent,
      topicId: savedTopic._id,
      topicVideo: req.body.materialVideo,
      videoSource:req.body.videoSource
    });

    // Save the topic material to the database
    const savedTopicMaterial = await topicMaterial.save();

    res.redirect('/course/course-topics/'+req.body.courseId); // Redirect to the topics page after successful creation
  } catch (error) {
    console.error('Error creating topic and topic material:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});

// router.get('/', verifyToken.verifyToken, async (req, res) => {
//   try {
//     // Retrieve all topics from the database
//     const topics = await TopicModel.find();

//     res.render('topics', { topics }); // Pass the topics data to the topics view for rendering
//   } catch (error) {
//     console.error('Error retrieving topics:', error);
//     return res.render('404',{message:"An error occurred while retrieving"});
//   }
// });


router.get('/edit/:id',verifyToken.verifyToken ,async (req, res) => {
  try {
    const topicId = req.params.id;
    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      // If topic is not found, render an error page or redirect to an error route
      return res.render('404', { message: 'Topic not found' });
    }
  
    // Find the topic by ID
    const auth = await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
    if(!auth){
     // return  res.redirect('/users');
    }
   
 

    // Find the topic material by topicId
    let topicMaterial = await TopicMaterialModel.findOne({ topicId });

    let quiz = await TopicQuizModel.findOne({ topicId });

    if (!topicMaterial) {
      // If topic material is not found, render an error page or redirect to an error route
      // return res.render('error', { message: 'Topic material not found' });
      topicMaterial = null;
    }
    if(!quiz){
      quiz = false;
    }else{
      quiz = true;
    }

    const admin  = req.user.isAdmin;
    //get video sources
    let videoSources = await SettingsModel.findOne();
    if(!videoSources){
      videoSources = ['youtube'];
    }else{
      videoSources = videoSources.videoSource;
    }
    res.render('editTopic', { topic, topicMaterial,quiz,admin,videoSources }); // Render the edit topic page with the retrieved data
  } catch (error) {
    if (error.name === 'CastError') {
      return res.render('404');
    }
   
    console.error('Error retrieving topic and topic material:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});

router.get('/createQuiz/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    // Retrieve all courses from the database

    const topicId = req.params.id;
    await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
    // Get the user's progress
    const admin  = req.user.isAdmin;
    res.render('createQuiz' ,{topicId,admin});
// Pass the courses and progress data to the courses view for rendering
  } catch (error) {
    if (error.name === 'CastError') {
      return res.render('404');
    }
    console.error('Error retrieving courses:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});

router.post('/createQuiz/:id', verifyToken.verifyToken ,validateCreateQuiz,async (req, res) => {
  try {
    
    const { topicId, questions } = req.body;


    if(req.body.errors){
      const errors = [
        {
          type: 'field',
          value: '',
          msg: 'Empty fields',
          path: 'title',
          location: 'body'
        }
      ]
     
     return await QuizController.renderCreateQuiz(topicId,req,res,errors); 
    }else{
      await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
      // Assuming you're using Mongoose for database operations
      const topicQuiz = new TopicQuizModel({
        topicId,
        questions: questions.map((q) => ({
          question: q.question.toString(), // Convert to string if necessary
          answer: q.answer.toString(),
          incorrectAnswer1: q.incorrectAnswer1.toString(),
          incorrectAnswer2: q.incorrectAnswer2.toString()
        }))
      });
  
      // Save the quiz data to the database
      const savedQuiz = await topicQuiz.save();
      res.redirect('/topics/edit/'+topicId);
      //res.status(200).json(savedQuiz);
    }

   
  } catch (error) {
    if (error.name === 'CastError') {
      return res.render('404');
    }
    console.error('Error saving quiz data:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});


router.put('/quiz/:id',  verifyToken.verifyToken,validateCreateQuiz,async (req, res) => {
  try {
    const { topicId, questions } = req.body;
    console.log(questions);
    if(req.body.errors){
      console.log("errors in the house");
      const errors = [
        {
          type: 'field',
          value: '',
          msg: 'Empty fields',
          path: 'title',
          location: 'body'
        }
      ]
     //return await QuizController.renderViewQuiz(topicId,req,res,errors);
      return res.status(400).json(errors);
    }

    await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);

    // Assuming you're using Mongoose for database operations
    const topicQuiz = new TopicQuizModel({
      topicId,
      questions: questions.map((q) => ({
        question: q.question.toString(), // Convert to string if necessary
        answer: q.answer.toString(),
        incorrectAnswer1: q.incorrectAnswer1.toString(),
        incorrectAnswer2: q.incorrectAnswer2.toString()
      }))
    });
    //delete the old quiz
    await  TopicQuizModel.deleteOne({topicId});
    // Save the quiz data to the database
    const savedQuiz = await topicQuiz.save();
    //res.redirect('/topics/quiz/'+topicId);
    res.status(200).json(savedQuiz);
  } catch (error) {
    console.error('Error saving quiz data:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});



router.get('/quiz/:id', verifyToken.verifyToken,async (req, res) => {
  try {
    const topicId = req.params.id;
    console.log("open day");
    console.log( req.params);
    
    await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
    // Find the quiz by topicId
    const quiz = await TopicQuizModel.findOne({ topicId });
  
    if (!quiz) {
      console.log("Quiz");
      // If the quiz is not found, return an error response
      return res.redirect("/material/"+topicId);
     // return res.status(404).json({ error: 'Quiz not found' });
    }

    // Return the quiz data
    const admin  = req.user.isAdmin;
    res.render('viewQuiz', { quiz,admin });
  } catch (error) {
  
    console.error('Error retrieving quiz data:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});




router.post('/edit/:id', verifyToken.verifyToken,topicCreateDataValidate,async (req, res) => {
  try {
    const topicId = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.headers.referer);
      const link = req.headers.referer.toString().split("/");
   
      //console.log(link[link.length-1]);
      //render the create topic page with error 
     
      return await TopicsController.renderEditTopic(topicId,req,res,errors.array());
      //return res.status(400).json({errors: errors.array()});
    }
    await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
    // Find the topic by ID
    const topic = await TopicModel.findById(topicId);

    if (!topic) {
      // If topic is not found, render an error page or redirect to an error route
      return res.render('error', { message: 'Topic not found' });
    }

    // Update the topic properties
    topic.title = req.body.topicTitle;
    topic.topicDesc = req.body.topicDesc;

    // Save the updated topic
    await topic.save();

    // Find the topic material by topicId
    const topicMaterial = await TopicMaterialModel.findOne({ topicId });

    if (!topicMaterial) {
      // If topic material is not found, render an error page or redirect to an error route
      return res.render('error', { message: 'Topic material not found' });
    }

    // Update the topic material properties
    topicMaterial.title = req.body.topicTitle;
    topicMaterial.content = req.body.materialContent;
    topicMaterial.topicVideo = req.body.materialVideo;
    topicMaterial.videoSource  = req.body.videoSource;

    // Save the updated topic material
    await topicMaterial.save();

    res.redirect('/topics/edit/'+topicId+"?response=success"); // Redirect to the topics page after successful update
  } catch (error) {
    console.error('Error updating topic and topic material:', error);
    res.status(500).send('An error occurred while updating the topic and topic material.');
  }
});


router.delete('/delete/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    const topicId = req.params.id;
    await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
    // Find the topic by ID and delete it
    await TopicModel.findByIdAndDelete(topicId);

    // Delete the topic material associated with the topic
    await TopicMaterialModel.deleteMany({ topicId });
    //delete quizzes 
    await TopicQuizModel.deleteMany({topicId:topicId});

    //res.redirect('/topics'); // Redirect to the topics page after successful deletion
    res.status(201).json(true);
  } catch (error) {
    console.log('Error deleting topic and topic material:', error);
    
    res.status(500).json('An error occurred while deleting the topic and topic material.');
  }
});



router.delete('/deleteQuiz/:id',verifyToken.verifyToken, async (req, res) => {
  try {
    const topicId = req.params.id;
    await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
    await TopicQuizModel.deleteMany({topicId});
    res.status(201).json("Topic deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
  

module.exports = router;
