const {UserProgressModel} = require('../models');


const getUserProgress = async (course,user) => {
    try {
        const topic  = await UserProgressModel.findOne({ course,user });
      
        
        return topic;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
  };
  
  module.exports = {
    getUserProgress,
  };