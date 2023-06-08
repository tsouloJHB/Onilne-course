const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const TopicMaterial = require('../models/topicMaterial');
const Topic = require('../models/topic');


router.get('/material/:topicId', verifyToken.verifyToken, async (req, res) => {
  try {
    const topicId = req.params.topicId;

    // Fetch the topic material data based on the topicId
    const topicMaterial = await TopicMaterial.findOne({ topicId });
    // Fetch the topic
    const topic = await Topic.findById(topicId);
    if (!topicMaterial) {
      // Handle case where topic material is not found
      return res.status(404).send('Topic material not found');
    }

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