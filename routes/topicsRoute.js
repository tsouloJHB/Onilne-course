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

    res.render('topics', { topics, progress }); // Pass the topics and progress data to the topics view for rendering
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

  

module.exports = router;
