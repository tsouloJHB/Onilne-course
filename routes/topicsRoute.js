const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { TopicModel, TopicMaterialModel,TopicQuizModel } = require('../models');
const {UsersController,TopicsController ,UserProgressController} = require('../controllers');

// Protected route using verifyToken middleware
router.get('/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    // Retrieve all topics from the database
    // const topics = await TopicModel.find();
    const courseId = req.params.id
    const topics = await TopicsController.getUserTopics(courseId);
    // Get the user's progress
   
   // const progress = await UsersController.getUserProgress(req.user._id);
    const progress = await UserProgressController.getUserProgress(courseId,req.user._id);
    const currentTopic = progress.progress;
    res.render('topics', { topics,currentTopic }); // Pass the topics and progress data to the topics view for rendering
  } catch (error) {
    console.error('Error retrieving topics:', error);
    res.status(500).send('An error occurred while retrieving the topics.');
  }
});




router.get('/create/:id', verifyToken.verifyToken, async (req, res) => {
  const courseId = req.params.id;
  // Route handling code for topics page
  const topicsCount = await TopicModel.countDocuments({ courseId }) + 1;
  res.render('createTopic',{courseId,topicsCount});
});  

router.post('/', async (req, res) => {
  try {
    const topicNo = req.body.topicNo;
    const courseId = req.body.courseId
    // Check if topic number already exists
    const existingTopic = await TopicModel.findOne({ topicNo,courseId:req.body.courseId });

    if (existingTopic) {
      // If topic number already exists, render the createTopics page with an error message
      return res.render('createTopic', { error: 'Topic number already exists. Consider updating the topic instead.' ,topicsCount:topicNo,courseId});
    }

    // Create a new topic
    const topic = new TopicModel({
      title: req.body.topicTitle,
      topicNo: topicNo,
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
    });

    // Save the topic material to the database
    const savedTopicMaterial = await topicMaterial.save();

    res.redirect('/course/course-topics/'+req.body.courseId); // Redirect to the topics page after successful creation
  } catch (error) {
    console.error('Error creating topic and topic material:', error);
    res.status(500).send('An error occurred while creating the topic and topic material.');
  }
});

router.get('/', verifyToken.verifyToken, async (req, res) => {
  try {
    // Retrieve all topics from the database
    const topics = await TopicModel.find();

    res.render('topics', { topics }); // Pass the topics data to the topics view for rendering
  } catch (error) {
    console.error('Error retrieving topics:', error);
    res.status(500).send('An error occurred while retrieving the topics.');
  }
});


router.get('/edit/:id', async (req, res) => {
  try {
    const topicId = req.params.id;

    // Find the topic by ID
    const topic = await TopicModel.findById(topicId);

    if (!topic) {
      // If topic is not found, render an error page or redirect to an error route
      return res.render('error', { message: 'Topic not found' });
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


    res.render('editTopic', { topic, topicMaterial,quiz }); // Render the edit topic page with the retrieved data
  } catch (error) {
    console.error('Error retrieving topic and topic material:', error);
    res.status(500).send('An error occurred while retrieving the topic and topic material.');
  }
});

router.get('/createQuiz/:id', verifyToken.verifyToken, async (req, res) => {
  try {
    // Retrieve all courses from the database

    const topicId = req.params.id;
    // Get the user's progress
    res.render('createQuiz' ,{topicId}); // Pass the courses and progress data to the courses view for rendering
  } catch (error) {
    console.error('Error retrieving courses:', error);
    res.status(500).send('An error occurred while retrieving the courses.');
  }
});

router.post('/createQuiz', async (req, res) => {
  try {
    const { topicId, questions } = req.body;

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

    res.status(200).json(savedQuiz);
  } catch (error) {
    console.error('Error saving quiz data:', error);
    res.status(500).send('An error occurred while saving quiz data.');
  }
});



router.get('/quiz/:id', async (req, res) => {
  try {
    const topicId = req.params.id;

    // Find the quiz by topicId
    const quiz = await TopicQuizModel.findOne({ topicId });

    if (!quiz) {
      // If the quiz is not found, return an error response
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Return the quiz data
    console.log(quiz);
    res.render('viewQuiz', { quiz });
  } catch (error) {
    console.error('Error retrieving quiz data:', error);
    res.status(500).send('An error occurred while retrieving quiz data.');
  }
});




router.post('/edit/:id', async (req, res) => {
  try {
    const topicId = req.params.id;

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
    topicMaterial.title = req.body.materialTitle;
    topicMaterial.content = req.body.materialContent;
    topicMaterial.topicVideo = req.body.materialVideo;

    // Save the updated topic material
    await topicMaterial.save();

    res.redirect('/topics'); // Redirect to the topics page after successful update
  } catch (error) {
    console.error('Error updating topic and topic material:', error);
    res.status(500).send('An error occurred while updating the topic and topic material.');
  }
});


router.post('/delete/:id', async (req, res) => {
  try {
    const topicId = req.params.id;

    // Find the topic by ID and delete it
    await TopicModel.findByIdAndDelete(topicId);

    // Delete the topic material associated with the topic
    await TopicMaterialModel.deleteMany({ topicId });

    res.redirect('/topics'); // Redirect to the topics page after successful deletion
  } catch (error) {
    console.error('Error deleting topic and topic material:', error);
    res.status(500).send('An error occurred while deleting the topic and topic material.');
  }
});




  

module.exports = router;
