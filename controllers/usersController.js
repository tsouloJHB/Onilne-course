const User = require('../models/usersModel');
const Topic = require('../models/topicModel');

const getUserProgress = async (userId) => {
  try {
    // Get the user's current topic number
    const user = await User.findById(userId);
    const currentTopicNo = user.currentTopic;

    // Get the total number of topics
    const totalTopics = await Topic.countDocuments();

    // Calculate the user's progress percentage
    const progress = (currentTopicNo / totalTopics) * 100;

    return progress;
  } catch (error) {
    console.error('Error retrieving user progress:', error);
    throw new Error('An error occurred while retrieving user progress.');
  }
};

module.exports = {
  getUserProgress,
};