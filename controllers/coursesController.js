const {CourseModel,UserProgressModel,CategoryModel} = require('../models');


module.exports.getUserCourses = async (userId) => {
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
  


module.exports.createCourse = async(req) =>{
  const course = new CourseModel({
    title: req.body.title,
    courseNo: req.body.courseNo,
    courseDesc: req.body.courseDesc,
    courseImage: req.body.courseImage,
    courseVideo: req.body.Video,
    user:req.user._id
  });

  const savedCourse = await course.save();
  return savedCourse;
}

module.exports.courseSearch = async(req,res) =>{  
  try {
    const searchQuery = req.query.search;
    const courses = await CourseModel.find({ title: { $regex: searchQuery, $options: 'i' } });
    return courses;
  } catch (err) {
    console.error('Error searching courses', err);
    res.status(500).send('Internal Server Error');
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

