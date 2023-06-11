const {TopicModel} = require('../models');


const getUserTopics = async (courseId) => {
    try {
        const topics  = await TopicModel.find({ courseId });
      
        
        return topics;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
  };
  
  module.exports = {
    getUserTopics,
  };