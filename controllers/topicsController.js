const {TopicModel, CourseModel} = require('../models');


module.exports.getUserTopics = async (courseId) => {
    try {
        const topics  = await TopicModel.find({ courseId });
      
        
        return topics;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
};

module.exports.topicUserAuthorized = async (userId,topicId,res) =>{
  try {
    const topic = await TopicModel.findById(topicId);
    const courseCheck = await CourseModel.find({_id:topic.topicId,user:userId});
    console.log(topic);
    // if(courseCheck.length < 1){
    //   res.redirect('/users');
    // }else{
    //   return false
    // }
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports.getCourseTopicsByTopic = async (topicId) =>{
  const topic = await TopicModel.findById(topicId);
 
  const topics = await TopicModel.find({courseId:topic.courseId});
  return topics
}



