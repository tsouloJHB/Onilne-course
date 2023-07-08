const TopicsController  = require("./topicsController");

const {TopicModel,TopicQuizModel} = require('../models');
module.exports.renderCreateQuiz = async(topicId,req,res,errors) =>{
    try {
        // Retrieve all courses from the database
    
     
        // await TopicsController.topicUserAuthorized(req.user._id,topicId,res,req);
        // Get the user's progress
        
        const admin  = req.user.isAdmin;
        
        res.render('createQuiz' ,{topicId,admin,errors});
    // Pass the courses and progress data to the courses view for rendering
      } catch (error) {
        if (error.name === 'CastError') {
          return res.render('404');
        }
        console.error('Error retrieving courses:', error);
        return res.render('404');
      }
}

module.exports.renderViewQuiz = async (topicId,req,res,errors) =>{
  try {
 
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
    console.log(errors);
    res.render('viewQuiz', { quiz,admin,errors });
  } catch (error) {
  
    console.error('Error retrieving quiz data:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
}
