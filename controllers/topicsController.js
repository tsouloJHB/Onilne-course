
const {TopicModel, CourseModel, UserProgressModel,TopicMaterialModel,TopicQuizModel} = require('../models');

//page renders

module.exports.renderCreateTopic = async(courseId,userId,req,res,errors) =>{
  try {
    console.log(courseId);
  
    // Route handling code for topics page
    
    return res.render('createTopic',{courseId,errors});
  } catch (error) {
    console.error('Error:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }

}
module.exports.renderEditTopic = async(topicId,req,res,errors) => {
  try {
   
    // Find the topic by ID
    const auth = await this.topicUserAuthorized(req.user._id,topicId,res,req);
    if(!auth){ 
     // return  res.redirect('/users');
    }
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

    const admin  = req.user.isAdmin;
    return res.render('editTopic', { topic, topicMaterial,quiz,admin,errors }); // Render the edit topic page with the retrieved data
  } catch (error) {
    if (error.name === 'CastError') {
      return res.render('404');
    }
   
    console.error('Error retrieving topic and topic material:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
}
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



