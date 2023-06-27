const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { TopicModel, TopicMaterialModel,TopicQuizModel, UserProgressModel } = require('../models');
const { CoursesController, UsersController, TopicsController } = require('../controllers');


router.get('/material/:topicId', verifyToken.verifyToken, async (req, res) => {
  try {
    const topicId = req.params.topicId;
  
    await CoursesController.checkIfUserIsRegisteredForCourseByTopic(req.user._id,topicId,res);
    // Fetch the topic material data based on the topicId
    const topicMaterial = await TopicMaterialModel.findOne({ topicId });
    // Fetch the topic
    const topic = await TopicModel.findById(topicId);
    if (!topicMaterial) {
      // Handle case where topic material is not found
      return res.status(404).send('Topic material not found');
    }
   
    // Pass the topic material data to the course outline view for rendering
    if(topicMaterial.topicVideo){
      const videoId = extractVideoId(topicMaterial.topicVideo);
      const embedLink = `https://www.youtube.com/embed/${videoId}`;
      topicMaterial.embedLink = embedLink;
    }
    //get users progress to further check if the user has completed the topic
    const progress  = await UserProgressModel.findOne({user:req.user._id,topic:topicId});
    const courseComplete = await CoursesController.checkIfUserCompletedCourse(topicId,req.user._id);
    const topicCompleted = await TopicsController.checkIfUserCompletedTopic(topicId,req.user._id);
    let currentTopic = true;
    console.log(progress);
    //check if the  users progress is less the topic number 
    if(topicCompleted || courseComplete || progress.progress < topic.topicNo){
     
      currentTopic = false
    }
    const topics = await TopicsController.getCourseTopicsByTopic(topic._id);
   
    res.render('courseOutline', { topicMaterial ,topic,currentTopic,topics});
  } catch (error) {
    console.error('Error retrieving topic material:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});

router.get('/quiz/:id', verifyToken.verifyToken,async (req, res) => {
  try {
    const topicId = req.params.id;
    //check if user has completed the course
    const course = await CoursesController.checkIfUserCompletedCourse(topicId,req.user._id);
    if(course){
      return res.redirect("/topicOutline/material/" + topicId);
    }
    //check if user has completed the topic
    const topicCompleted = await TopicsController.checkIfUserCompletedTopic(topicId,req.user._id);
    if(topicCompleted){
      return res.redirect("/topicOutline/material/" + topicId);
    }
    // Find the quiz by topicId
    const quiz = await TopicQuizModel.findOne({ topicId });

    if (!quiz) {
      // If the quiz is not found, return an error response
      return res.redirect("/topicOutline/material/" + topicId + "?error=No topic found");
      //return res.status(404).json({ error: 'Quiz not found' });
    }

    // Shuffle the answer options for each question
    quiz.questions.forEach((question) => {
      const options = [
        question.answer,
        question.incorrectAnswer1,
        question.incorrectAnswer2
      ];

      // Shuffle the options array
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      // Update the shuffled options in the question object
      question.answer = options[0];
      question.incorrectAnswer1 = options[1];
      question.incorrectAnswer2 = options[2];
    });

    console.log(quiz);

    // Return the quiz data
    res.render('quizTest', { quiz, topicId });
  } catch (error) {
    console.error('Error retrieving quiz data:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
});


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  console.log(array);
  return array;
}


router.post('/quizsubmit', async (req, res) => {
    try {
      
    } catch (error) {
      console.log(error);
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