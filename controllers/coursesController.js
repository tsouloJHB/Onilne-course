const {CourseModel,UserProgressModel} = require('../models');


const getUserCourses = async (userId) => {
    try {
        const userProgresses = await UserProgressModel.find({ user: userId });
      
        const courses = await Promise.all(userProgresses.map(async (progress) => {
            console.log(progress.course);
          const course = await CourseModel.findById(progress.course);
          return course;
        }));
        
        return courses;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
  };
  
  module.exports = {
    getUserCourses,
  };