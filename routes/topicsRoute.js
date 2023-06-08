const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Topic = require('../models/topic');
const TopicMaterial = require('../models/topicMaterial');
const userController = require('../controllers/usersController');

// Protected route using verifyToken middleware
router.get('/', verifyToken.verifyToken, async (req, res) => {
  try {
    // Retrieve all topics from the database
    const topics = await Topic.find();

    // Get the user's progress
   
    const progress = await userController.getUserProgress(req.user._id)
    const currentTopic = req.user.currentTopic;
    res.render('topics', { topics, progress,currentTopic }); // Pass the topics and progress data to the topics view for rendering
  } catch (error) {
    console.error('Error retrieving topics:', error);
    res.status(500).send('An error occurred while retrieving the topics.');
  }
});




router.get('/create', verifyToken.verifyToken, (req, res) => {
  // Route handling code for topics page
  res.render('createTopic');
});  

router.post('/', async (req, res) => {
  try {
    const topicNo = req.body.topicNo;

    // Check if topic number already exists
    const existingTopic = await Topic.findOne({ topicNo });

    if (existingTopic) {
      // If topic number already exists, render the createTopics page with an error message
      return res.render('createTopic', { error: 'Topic number already exists. Consider updating the topic instead.' });
    }

    // Create a new topic
    const topic = new Topic({
      title: req.body.topicTitle,
      topicNo: topicNo,
      topicDesc: req.body.topicDesc,
    });

    // Save the topic to the database
    const savedTopic = await topic.save();

    // Create a new topic material
    const topicMaterial = new TopicMaterial({
      title: req.body.materialTitle,
      content: req.body.materialContent,
      topicId: savedTopic._id,
      topicVideo: req.body.materialVideo,
    });

    // Save the topic material to the database
    const savedTopicMaterial = await topicMaterial.save();

    res.redirect('/topics'); // Redirect to the topics page after successful creation
  } catch (error) {
    console.error('Error creating topic and topic material:', error);
    res.status(500).send('An error occurred while creating the topic and topic material.');
  }
});

router.get('/', verifyToken.verifyToken, async (req, res) => {
  try {
    // Retrieve all topics from the database
    const topics = await Topic.find();

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
    const topic = await Topic.findById(topicId);

    if (!topic) {
      // If topic is not found, render an error page or redirect to an error route
      return res.render('error', { message: 'Topic not found' });
    }

    // Find the topic material by topicId
    const topicMaterial = await TopicMaterial.findOne({ topicId });

    if (!topicMaterial) {
      // If topic material is not found, render an error page or redirect to an error route
      return res.render('error', { message: 'Topic material not found' });
    }

    res.render('editTopic', { topic, topicMaterial }); // Render the edit topic page with the retrieved data
  } catch (error) {
    console.error('Error retrieving topic and topic material:', error);
    res.status(500).send('An error occurred while retrieving the topic and topic material.');
  }
});


router.post('/edit/:id', async (req, res) => {
  try {
    const topicId = req.params.id;

    // Find the topic by ID
    const topic = await Topic.findById(topicId);

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
    const topicMaterial = await TopicMaterial.findOne({ topicId });

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
    await Topic.findByIdAndDelete(topicId);

    // Delete the topic material associated with the topic
    await TopicMaterial.deleteMany({ topicId });

    res.redirect('/topics'); // Redirect to the topics page after successful deletion
  } catch (error) {
    console.error('Error deleting topic and topic material:', error);
    res.status(500).send('An error occurred while deleting the topic and topic material.');
  }
});




  

module.exports = router;
