const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { TopicModel, TopicMaterialModel,TopicQuizModel } = require('../models');


router.get('/material/:topicId', verifyToken.verifyToken, async (req, res) => {
  try {
    const topicId = req.params.topicId;

    // Fetch the topic material data based on the topicId
    const topicMaterial = await TopicMaterialModel.findOne({ topicId });
    // Fetch the topic
    const topic = await TopicModel.findById(topicId);
    if (!topicMaterial) {
      // Handle case where topic material is not found
      return res.status(404).send('Topic material not found');
    }
    console.log(topicMaterial);
    // Pass the topic material data to the course outline view for rendering
    const videoId = extractVideoId(topicMaterial.topicVideo);
    const embedLink = `https://www.youtube.com/embed/${videoId}`;
    topicMaterial.embedLink = embedLink;
    console.log(topicMaterial);
    res.render('courseOutline', { topicMaterial ,topic});
  } catch (error) {
    console.error('Error retrieving topic material:', error);
    res.status(500).send('An error occurred while retrieving the topic material.');
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
    res.render('quizTest', { quiz });
  } catch (error) {
    console.error('Error retrieving quiz data:', error);
    res.status(500).send('An error occurred while retrieving quiz data.');
  }
});

function extractVideoId(videoLink) {
  // Check if the video link contains a query parameter 'v'
  const videoIdMatch = videoLink.match(/[?&]v=([^&]+)/);
  
  if (videoIdMatch) {
    return videoIdMatch[1]; // Return the captured video ID
  } else {
    // If the video link format is different, you can implement additional logic here
    throw new Error('Invalid YouTube video link');
  }
}

module.exports = router;