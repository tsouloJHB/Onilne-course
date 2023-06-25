const {UserProgressModel} = require('../models');


module.exports.getUserCourseProgress = async (course,user) => {
    try {
        const topic  = await UserProgressModel.findOne({ course,user });
      
        
        return topic;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
};

module.exports.getUserProgress = async (userId)=>{
  try {
    const coursesProgress = await UserProgressModel.find({userId});
    return coursesProgress;
  } catch (error) {
    console.error(error);
    return false;
  }
}
