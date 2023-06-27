const { query } = require('express');
const {CourseModel,UserProgressModel,CategoryModel,TopicModel, TopicQuizModel} = require('../models');
const TopicMaterial = require('../models/topicMaterialModel');
const CoursesModel = require('../models/coursesModel');


module.exports.getUserCourses = async (userId) => {
    try {
        const userProgresses = await UserProgressModel.find({ user: userId });

        const courses = await Promise.all(userProgresses.map(async (progress) => {
           
          //const course = await CourseModel.findById(progress.course);
          const course = await CourseModel.findOne({_id:progress.course,active:true});
          return course;
        }));
      
        const filteredCourses = courses.filter((course) => course !== null);
       
        return filteredCourses;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
  };

  

  module.exports.getUserCreatedCourses = async(userId) =>{
    // try {
    //   const created 
    // } catch (error) {
      
    // }
  }

// module.exports.createCourse = async(req) =>{
//   const course = new CourseModel({
//     title: req.body.title,
//     courseNo: req.body.courseNo,
//     courseDesc: req.body.courseDesc,
//     courseImage: req.body.courseImage,
//     courseVideo: req.body.Video,
//     user:req.user._id
//   });

//   const savedCourse = await course.save();
//   return savedCourse;
// }
// module.exports.courseSearch = async (req, res) => {
//   try {
//     const searchQuery = req.query.search;
//     const query = {
//       $or: [
//         { title: { $regex: searchQuery, $options: 'i' } },
//         {  courseDesc: { $regex: searchQuery, $options: 'i' } }
//       ]
//     };
//     const courses = await CourseModel.find(query);
    
  
//     return courses;
//   } catch (err) {
//     console.error('Error searching courses', err);
//     res.status(500).send('Internal Server Error');
//   }
// };


module.exports.courseSearch = async (req, res) => {
  try {
    const searchQuery = req.query.search;

    // Search in CourseModel by title
    const courseQuery = {
      title: { $regex: searchQuery, $options: 'i' }
    };
    const coursesByTitle = await CourseModel.find(courseQuery);

    if (coursesByTitle.length > 0) {
      // If there are matching courses by title, return them
   
      return coursesByTitle;
    } else {
      // If no matching courses by title, search in CategoryModel by name
      const categoryQuery = {
        name: { $regex: searchQuery, $options: 'i' }
      };
      const categories = await CategoryModel.find(categoryQuery);

      if (categories.length > 0) {
        // If there are matching categories by name, retrieve the courses for each category
        const categoryIds = categories.map(category => category._id);
        const coursesByCategory = await CourseModel.find({ category: { $in: categoryIds } });

        return coursesByCategory;
      } else {
        // If no matching courses or categories, return an empty array
        return [];
      }
    }
  } catch (err) {
    console.error('Error searching courses', err);
    return res.status(500).send('Internal Server Error');
  }
};



module.exports.getCourseCategories = async() =>{
  try {
    const categories = await CategoryModel.find();
    res.json(categories);
  } catch (err) {
    console.error('Error retrieving categories', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports.createCategory = async (name) => {
  try {
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return {
        success: false,
        message: 'Category already exists'
      };
    }

    const category = new CategoryModel({
      name
    });
    await category.save();

    return {
      success: true,
      category:name,
      message: 'Category created successfully'
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: 'Error creating category'
    };
  }
};

//create course
module.exports.createCourse = async(req) =>{
  try {
    const courseCount = await CourseModel.countDocuments()+1;
    const course = new CourseModel({
      title: req.body.title,
      courseNo: courseCount,
      courseDesc: req.body.courseDesc,
      courseImage: req.body.courseImage,
      courseVideo: req.body.Video,
      user:req.user._id,
      category:req.body.category
    });
    const savedCourse = await course.save();
    return {
        success:true,
        course:savedCourse,
        message:""
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      success:false,
      course: "",
      message: 'An error occurred while creating the course.'
    };
  }
}

//update course
module.exports.updateCourse = async(req) =>{
  try {
    
    const course = {
      title: req.body.title,
      courseDesc: req.body.courseDesc,
      category:req.body.category
    };
    
    const courseUpdate =  await CourseModel.findOneAndUpdate({_id:req.params.id},course, { new: true });
    console.log(courseUpdate);
    if(!courseUpdate){
      return {
        success:false,
        course:courseUpdate,
        message:"client information incorrect",
        code:401
      };
    }
    // const savedCourse = await course.save();
    return {
        success:true,
        course:courseUpdate,
        message:"",
        code:201
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      success:false,
      course: "",
      message: 'An error occurred while creating the course.',
      code:500
    };
  }
}

module.exports.deleteCourse = async(courseId,res) =>{
  try { 
    
    const course = await CourseModel.findById(courseId);
    //check if course exits 
    if (!course) {
      return res.status(404).send('Course not found');
    }
    // Find the topics by course ID
    const topics  =  await TopicModel.find({courseId});

    // Delete the topic material associated with the topic
    await Promise.all(topics.map(async (topic) => {
      console.log(topic);
      await TopicMaterial.deleteMany({topicId:topic._id});
      //delete quizzes 
      await TopicQuizModel.deleteMany({topicId:topic._id});
    }));
    await TopicModel.deleteMany({ courseId });
  
    // //delete course
    await CourseModel.findByIdAndDelete(courseId);
    return true;

  } catch (error) {
    console.error('Error deleting course:', error);
    // res.status(500).send('An error occurred while deleting the course.');
    return false;
  }
}

module.exports.courseData = async(courseId)=>{
  try {
    //search userProgressModule for specified course
    const usersCount = await UserProgressModel.countDocuments({course:courseId});
    const completedUsers = await UserProgressModel.countDocuments({course:courseId,completed:true});
    return {
      usersCount:usersCount,
      completed:completedUsers,
      message:"Success",
      status:true
    };
  } catch (error) {
    return {
      usersCount:null,
      message:error,
      status:false
    };
  }
}

module.exports.coursesWithData = async(courses) =>{
  const courseData = await Promise.all(courses.map(async (course) => {
    const courseData =  await this.courseData(course);
    // course.usersCount = courseData.usersCount;
    // course.completed = courseData.completed;
    const newCourse = {
      title: course.title,
      courseNo: course.courseNo,
      user: course.user,
      courseDesc: course.courseDesc,
      category: course.category,
      active:course.active,
      courseImage: course.courseImage,
      _id: course._id,
      __v: course.__v,
      usersCount : courseData.usersCount,
      completed:courseData.completed
    }
    //course.set(courseData);
    // console.log(newCourse);
    return newCourse;
  }));

  return courseData
}

module.exports.getTopFiveCourses = async(userId)=>{
  try {
    // Find the courses associated with the user from registration  in userProgressModel
    const userProgress = await UserProgressModel.find({ user: userId }, 'course');
    // find user created course
    const userCourses = await CourseModel.find({user:userId});

 

    if(userProgress.length != 0){
      const userCourseIds = userProgress.map((progress) => progress.course);
      userCourses.forEach((course) => {
        if (!userCourseIds.includes(course._id)) {
          userCourseIds.push(course._id);
        }
      });
    
      // Find the top 5 courses based on appearance in UserProgress, excluding the user's courses
      console.log(userCourseIds);
      // const topCourses = await CoursesModel.aggregate([
      //   { $match: { _id: { $nin: userCourseIds } } },
      //   { $group: { _id: '$course', count: { $sum: 1 } } },
      //   { $sort: { count: -1 } },
      //   { $limit: 5 },
      // ]);

     let topCourses = await CoursesModel.find({_id:{$nin:userCourseIds},active:true});
     // let filteredTopCourses = topCourses.filter((course) => course._id !== null);
     
      if(topCourses.length < 1){
        console.log("filter");
        //topCourses = await getRandomFiveCourses(userId,userCourseIds);
      }

      return topCourses;
    }else{
      const courses = await CourseModel.find({ user: { $ne: userId } }).limit(5);
      return courses;
    }
    // Extract the course IDs associated with the user
    // Handle the top courses data
  } catch (error) {
    console.error(error);
    // Handle any errors
  }
}

//get 5 courses the user is not registered for  using ProgressModule 
const getRandomFiveCourses = async (userId,userCourseIds) =>{
  
  const courses = await CourseModel.find({ user: { $ne: userId } }).limit(5);
  return courses;
}

module.exports.courseUserAuthorized = async (userId,courseId,res,req) =>{
  try {
    
    const courseCheck = await CourseModel.find({_id:courseId,user:userId});
    if(courseCheck.length < 1){
      if(req.user.isAdmin){
       
        return res.redirect('/admin');
      }else{
        return res.redirect('/users');
      }
    }else{
      return false
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports.checkIfUserIsRegisteredForCourse = async  (userId,courseId,res) =>{
  try {
    const userProgress  = await UserProgressModel.findOne({user:userId,course:courseId});
    if(!userProgress){
      if(!res.user.isAdmin){
        return res.redirect('/users');
      }else{
        return res.redirect('/admin');
      }
      
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports.checkIfUserIsRegisteredForCourseByTopic = async  (userId,topicId,res) =>{
  try {
    const topic = await TopicModel.findById(topicId); 
    const userProgress  = await UserProgressModel.findOne({user:userId,course:topic.courseId});
    if(!userProgress){
      if(!res.user.isAdmin){
        return res.redirect('/users');
      }else{
        return res.redirect('/admin');
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports.checkCourseActive = async  (courseId,res) =>{
  try {
    const activeCheck = {
      active:true,
      topics: true
    };
    const course = await CourseModel.findOne({_id:courseId,active:true});
    if(!course){
      
      activeCheck.active = false;
    }
    const topicsCount = await TopicModel.countDocuments({courseId});
    if(topicsCount < 1 ){
      activeCheck.topics = false;
    }
    return activeCheck;
  } catch (error) {
    console.log(error);
  }
}

module.exports.activateCourse = async  (courseId) =>{
  try {
   
    const course = await CourseModel.findByIdAndUpdate(courseId,{active:true});
    if(!course){
      return false;
    }
    return true;    
  } catch (error) {
    console.log(error );
    return false;
  }
} 

module.exports.checkIfUserCompletedCourse = async  (topicId,userId) =>{
  //if the user completes a quiz check if the topics count is equal users progress count

 try {
  const topic = await TopicModel.findById(topicId);
  const progress = await UserProgressModel.findOne({course:topic.courseId,user:userId});
   
   if(progress.completed){
     return true;
   } 
   return false;
 } catch (error) {
  console.log(error);
  return false;

 }

}