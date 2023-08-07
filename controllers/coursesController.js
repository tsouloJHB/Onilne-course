const { query } = require('express');
const {CourseModel,UserProgressModel,CategoryModel,TopicModel, TopicQuizModel, UserModel} = require('../models');
const TopicMaterial = require('../models/topicMaterialModel');
const CoursesModel = require('../models/coursesModel');
const UserProgressController = require('./userProgressController');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;


//page renders
module.exports.renderCoursesPage = async (req, res, errors) => {
  try {
    // Retrieve all courses from the database
    const courses = await CourseModel.find({ active: true });
    const coursesCount = await CourseModel.countDocuments() + 1;

    res.render('courses', { errors, courses, coursesCount });
  } catch (error) {
    console.error('Error retrieving courses:', error);
    return res.render('404', { message: "An error occurred while retrieving" });
  }
}

module.exports.renderCourseCreatedPage = async (req, res, errors) => {
  try {
    // Retrieve all courses from the database
    const categories =  await CategoryModel.find();
          
   
    const courses = await CourseModel.find({user:req.user._id});
    const coursesCount = await CourseModel.countDocuments();
    const coursesWithData = await this.coursesWithData(courses);
    res.render('courses',{courses:coursesWithData,coursesCount,categories,errors});
     
  } catch (error) { 
    console.error('Error retrieving courses:', error);
    return res.render('404',{message:"An error occurred while retrieving"});
  }
}
module.exports.getUserCourses = async (userId,completed=false) => {
    try {
        let userProgresses = [];
        console.log(completed);
        if(!completed){
           userProgresses = await UserProgressModel.find({ user: userId });
        }else{
           userProgresses = await UserProgressModel.find({ user: userId ,completed:false});
        }
        
        const courses = await Promise.all(userProgresses.map(async (progress) => {
           
          //const course = await CourseModel.findById(progress.course);
          const course = await CourseModel.findOne({_id:progress.course,active:true}).populate('user');;
          let modifiedCourse = {};
          if(course){
            let countTopics = await TopicModel.countDocuments({courseId:course._id});
            console.log("Topics "+ countTopics)
            countTopics++;
            let percentage =  progress.progress == 1 && countTopics == 1  || progress.progress == 0 || progress.progress == 1 ? 0: (progress.progress/countTopics) * 100;
            console.log("countTopics "+ countTopics + "current topic " + progress.progress);
            console.log((progress.progress/countTopics) * 100);
            percentage = percentage == 100 & progress.completed == false ? 90 : percentage;
            percentage = Number(percentage.toFixed(0));
           
            //get the category fo the course
            const category = await CategoryModel.findById(course.category);
            //get remaining hours 
            const hours = course.hours ? course.hours : 0;
          
            let remainingHours = (hours * (100 - percentage) / 100).toFixed(0);
            remainingHours = progress.completed ? 0:remainingHours;
            const rating = await this.getAverageRating(course.ratings);
             modifiedCourse = {
              ...course.toObject(), // Spread the properties of the course object
              progress: progress.progress,
              completed:progress.completed,
              percentage:percentage, // Add the progress field
              categoryName:category.name,
              remainingHours:remainingHours,
              topics:countTopics,
              rating:rating
            };
          }else{
            modifiedCourse = course
          }
         

        
          return modifiedCourse;
        }));
   
        const filteredCourses = courses.filter((course) => course !== null);
       
        return filteredCourses;
      } catch (error) {
        console.error('Error retrieving user progress:', error);
        throw new Error('An error occurred while retrieving user progress.');
      }
  };

  module.exports.getUserCourseCompletePercentage = async(courseId,userId)=>{
    try {
      const userProgresses = await UserProgressModel.findOne({ user: userId,course:courseId});
      let countTopics = await TopicModel.countDocuments({courseId});
      countTopics++;
     // const percentage =  ( userProgresses.progress/countTopics) * 100;
      let percentage =  userProgresses.progress== 1 && countTopics == 1  || userProgresses.progress == 0 ||userProgresses.progress == 1 ? 0: (userProgresses.progress/countTopics) * 100;
      return percentage.toFixed(1);
    } catch (error) {
      return 0;
   
    }
  } 
  

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

module.exports.checkIfUserIsCourseRegistered = async (userId,courseId) =>{
  try {
      const course = await UserProgressModel.findOne({user:userId,course:courseId});
      if(course){
        return true;
      }
  
      return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports.courseSearch = async (req, res) => {
  try {
    const searchQuery = req.query.search;

    // Search in CourseModel by title
    const courseQuery = {
      title: { $regex: searchQuery, $options: 'i' },
      active:  true
    };
    const coursesByTitle = await CourseModel.find(courseQuery).limit(10);
   
    if (coursesByTitle.length > 0) {

      // If there are matching courses by title, return them
     
      const courses = [];
      for (const course of coursesByTitle) {
        let owner = false;
        let userId = req.user._id;
        let userCourse = course.user;
        //check if the user owns the course
        if (userId.toString() === userCourse.toString()) {
          owner = true;
        }
        //check if the user has started the course
        const registered = await this.checkIfUserIsCourseRegistered(req.user._id, course.user);
        const modifiedCourse = {
          ...course.toObject(), // Spread the properties of the course object
          owner: owner, // Add the progress field
          registered: registered
        };
      
        courses.push(modifiedCourse);
      }
      
     
      return courses;
      
    } else {
      // If no matching courses by title, search in CategoryModel by name
      const categoryQuery = {
        name: { $regex: searchQuery, $options: 'i' }
      };
      const categories = await CategoryModel.find(categoryQuery);

      if (categories.length > 0) {
        // If there are matching categories by name, retrieve the courses for each category
        const categoryIds = categories.map(category => category._id);
        const coursesByCategory = await CourseModel.find({ category: { $in: categoryIds } ,  active:  true}).limit(10);
        const courses = [];
        for (const course of coursesByCategory) {
          let owner = false;
          let userId = req.user._id;
          let userCourse = course.user;
          //check if the user owns the course
          if (userId.toString() === userCourse.toString()) {
            owner = true;
          }
          //check if the user has started the course
          const registered = await this.checkIfUserIsCourseRegistered(req.user._id, course.user);
          const modifiedCourse = {
            ...course.toObject(), // Spread the properties of the course object
            owner: owner, // Add the progress field
            registered: registered
          };
        
          courses.push(modifiedCourse);
        }

        return courses;
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


module.exports.courseSuggestionSearch = async (req, res) => {
  try {
    const query = req.query.search;
    const courseQuery = {
      title: { $regex: query, $options: 'i' },
      active:  true
    };
    const coursesByTitle = await CourseModel.find(courseQuery);
    let data = {
        courses:"",
        categories:""
    }
    data.courses =coursesByTitle;

    const categoryQuery = {
      name: { $regex: query, $options: 'i' }
    };
    const categories = await CategoryModel.find(categoryQuery);
    // data.push(categories);
    data.categories = categories;
    // console.log(data)
    return data;
  } catch (error) {
    
  }
}


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

const resizeImage = async (filename) => {
  try {
    // Define the output filename for the resized image (with PNG extension)
    const resizedFilename = `resized_${path.basename(filename, path.extname(filename))}.png`;

    // Resize the image and save the resized image in PNG format
    await sharp(`public/images/courseimages/${filename}`)
      .resize(350, 250)
      .toFile(`public/images/courseimages/${resizedFilename}`);

    console.log('Image resized and converted to PNG successfully!');
    return resizedFilename; // Return the resized filename
  } catch (error) {
    console.log('Error resizing image:', error);
    throw error; // Rethrow the error to be caught in the calling function
  }
};
//create course
module.exports.createCourse = async(req) =>{
  try {
        // Get the uploaded file information from the `req.file` object

    const { filename, path } = req.file;
    const courseCount = await CourseModel.countDocuments()+1;
    
    const course = new CourseModel({
      title: req.body.title,
      courseNo: courseCount,
      courseDesc: req.body.courseDesc,

      courseVideo: req.body.Video,
      user:req.user._id,
      category:req.body.category,
      courseImage:'/images/courseimages/'+req.file.filename,
      difficulty:req.body.difficulty,
      prerequisites:req.body.prerequisites,
      language:req.body.language,
      hours:req.body.hours,
      material:req.body.material
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
    console.log(req.body);
    const course = {
      title: req.body.title,
      courseDesc: req.body.courseDesc,
      category:req.body.category,
      prerequisites:req.body.prerequisites,
      material:req.body.material,
      hours:req.body.hours,
      language:req.body.language,
      difficulty:req.body.difficulty,
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

module.exports.updateCourseImage = async (req, res) => {
  try {
    // Resize the uploaded image using Sharp and convert to PNG
    const resizedFilename = await resizeImage(req.file.filename);

    // Update the course image path in the database with the resized image path
    const courseImage = '/images/courseimages/' + resizedFilename;
    const updateImage = await CourseModel.findByIdAndUpdate(req.body.courseId, { courseImage });

    if (!updateImage) {
      return res.status(400).json("Error saving image");
    }

    // Delete the old image (original uploaded image)
    await deleteOldImage(req.file.filename);

    return res.status(201).json("Success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error saving image");
  }
};

const deleteOldImage = async (filename) => {
  try {
    // Delete the old image (original uploaded image)
    await fs.unlink(`public/images/courseimages/${filename}`);
    console.log('Old image deleted successfully!');
  } catch (error) {
    console.log('Error deleting old image:', error);
    throw error; // Rethrow the error to be caught in the calling function
  }
};

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
     await CategoryModel.find();
     //let topCourses = await CoursesModel.find({_id:{$nin:userCourseIds},active:true});
     let topCourses = await CoursesModel.find({ _id: { $nin: userCourseIds }, active: true }).populate('category', 'name');
     // let filteredTopCourses = topCourses.filter((course) => course._id !== null);
     console.log(topCourses);
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
    if (error.name === 'CastError') {
      return res.render('404');
    }
    console.log(error);
    return false;
  }
}

module.exports.checkIfUserIsRegisteredForCourse = async  (userId,courseId,req,res) =>{
  try {
    const userProgress  = await UserProgressModel.findOne({user:userId,course:courseId});
    if(!userProgress){
      if(!req.user.isAdmin){
        return res.render('404');
      }else{
        return res.redirect('/admin');
      }
      
    }
    return false;
  } catch (error) {
    if (error.name === 'CastError') {
      return res.render('404');
    }
    console.log(error);
  }
}

module.exports.checkIfUserIsRegisteredForCourseByTopic = async  (userId,topicId,req,res) =>{
  try {
    const topic = await TopicModel.findById(topicId);
    if(!topic){
      if(!req.user.isAdmin){
        return res.render('404');
      }else{
        return res.redirect('/admin');
      }
    } 
    const userProgress  = await UserProgressModel.findOne({user:userId,course:topic.courseId});
    if(!userProgress){
      if(!req.user.isAdmin){
        return res.redirect('/users');
      }else{
        return res.redirect('/admin');
      }
    }
    return false
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

module.exports.checkCourseComplete = async(courseId,userId) =>{
  try {
    const progress = await UserProgressController.getUserProgress(courseId,userId);

    let downloadCertificate = {
      completed:false,
      link:""
    };
  
    if(progress != null && progress.completed){
      downloadCertificate.completed = true;
      downloadCertificate.link = progress.certificate;
    }
    return downloadCertificate;
  } catch (error) {
    console.log(error);
    return downloadCertificate;
 
  }
}

module.exports.getCourseCreator = async(courseId) => {
  const course  = await CourseModel.findById(courseId);
  const user = await UserModel.findById(course.user);
  return {
    user:user,
    course,course
  }
}

module.exports.countCourseRegisteredUser = async(courseId) =>{
  try {
      courseCount = await UserProgressModel.countDocuments({course:courseId});
      return courseCount;
  } catch (error) {
    console.log(courseCount);
    return 0;
  }
}

module.exports.saveRating = async (req, res) => {
  try {
    console.log(req.body);
    const courseId = req.body.courseId;
    const rating = req.body.rating;
    const userId = req.user._id;

    // Retrieve the course and check if it exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.redirect('/topics/' + courseId + '?error=Course not found');
    }

    // Check if the user has already rated the course
    // const existingRating = course.ratings.find(
    //   (ratingObj) => ratingObj.user.toString() === userId.toString()
    // );
    // if (existingRating) {
    //   return res.redirect('/topics/' + courseId + '?error=User has already rated this course');
    // }

    // Check if the user has already rated the course
    const hasRated = await this.hasUserRatedCourse(userId, courseId);
    if (hasRated) {
      return res.redirect('/topics/' + courseId + '?error=User has already rated this course');
    }

    // Add the new rating to the course's ratings array
    course.ratings.push({ user: userId, rating });

    // Calculate the updated average rating for the course
    const totalRatings = course.ratings.length;
    const sumRatings = course.ratings.reduce((acc, ratingObj) => acc + ratingObj.rating, 0);
    const averageRating = sumRatings / totalRatings;

    // Update the course's average rating
    course.averageRating = averageRating;

    // Save the updated course
    await course.save();

    res.redirect('/topics/' + courseId + '?success=Rating saved successfully');
  } catch (error) {
    console.error('Error saving rating:', error);
    res.redirect('/topics/' + courseId + '?error=An error occurred while saving the rating');
  }
};


// Check if user has already rated the course
exports.hasUserRatedCourse = async (userId, courseId) => {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const existingRating = course.ratings.find(
    (ratingObj) => ratingObj.user.toString() === userId.toString()
  );

  return !!existingRating; // Convert to boolean using double negation
};

// Controller function to get course ratings
exports.getCourseRatings = async (courseId) => {
  try {
    // Retrieve the course and check if it exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Extract the ratings from the course
    const ratings = course.ratings;

    return ratings;
  } catch (error) {
    console.error('Error getting course ratings:', error);
    throw new Error('An error occurred while getting course ratings');
  }
};

exports.getAverageRating = async (ratings) => {
  try {


    // Calculate average rating
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((acc, ratingObj) => acc + ratingObj.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    return averageRating
  } catch (error) {
    throw new Error('error occurred');

  }
};

exports.getCourseByCategory = async (req, res) => {
  try {
    const course = req.body.course.toLowerCase();
    
    if(!course){
      res.status(400);
    }
    console.log(course);
    const coursesByCategory = await CourseModel.find({ title:course,  active:  true}).limit(10);

    const categories = await CategoryModel.find({name:course});
    console.log(categories);
    if (categories.length > 0) {
      // If there are matching categories by name, retrieve the courses for each category
      const categoryIds = categories.map(category => category._id);
      const coursesByCategory = await CourseModel.find({ category: { $in: categoryIds } ,  active:  true}).limit(10);
      const courses = [];
      for (const course of coursesByCategory) {
        courses.push(course);
      }
     
      res.status(200).json(courses);
    }
    res.status(400);
  } catch (error) {
   
    res.status(400);
    console.log(error);

  }
};
