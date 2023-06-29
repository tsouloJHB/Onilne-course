const {TopicModel, CourseModel, UserProgressModel} = require('../models');


module.exports.getUserTopics = async (courseId) => {
    try {
        const topics  = await TopicModel.find({ courseId });
      
        
        return topics;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
};

module.exports.topicUserAuthorized = async (userId,topicId,res,req) =>{
  try {
    const topic = await TopicModel.findById(topicId);
   
    const courseCheck = await CourseModel.find({_id:topic.courseId,user:userId});
    console.log(courseCheck);
    if(courseCheck.length < 1){
       if(req.user.isAdmin){
        return res.redirect('/admin');
      }
        return res.redirect('/users');
   
     
    }else{
      return false
    }
  } catch (error) {
    //console.log();
    if (error.name === 'CastError') {
      // Handle the cast error
      console.log(error);
      if(req.user.isAdmin){
        return res.redirect('/admin');
      }
        return res.redirect('/users');
      // Return an error response, redirect, or perform any other necessary action
    }
    return false;
  }
}

module.exports.getCourseTopicsByTopic = async (topicId) =>{
  const topic = await TopicModel.findById(topicId);
 
  const topics = await TopicModel.find({courseId:topic.courseId});
  return topics
}

module.exports.checkIfUserCompletedTopic = async (topicId,userId) =>{
 
  try {
    //get course 
    const topic = await TopicModel.findById(topicId);
    const progress = await UserProgressModel.findOne({course:topic.courseId,user:userId});
  
    if( progress.progress > topic.topicNo ){
      
      return true;
    } 
    return false;
  } catch (error) {
  console.log(error);
  return false;

  }
  

}



