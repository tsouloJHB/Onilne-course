const express = require('express');
const router = express.Router();
const {verifyToken, isAdmin} = require('../middleware/verifyToken');
const { CourseModel, CategoryModel, UserModel, SettingsModel } = require('../models');
const { CoursesController, SettingsController } = require('../controllers');
const { render } = require('ejs');
const { upload } = require('../middleware/upload');


// Protected route using verifyToken middleware
router.get('/', verifyToken,isAdmin, async (req, res) => {
    try {
      // Retrieve all topics from the database
      const { user } = req.session;
      const courses = await CourseModel.find();
      const coursesCount = await CourseModel.countDocuments();
      const users = await UserModel.countDocuments({isAdmin:false});
      const appInfo = {
        users:users,
        coursesCount:coursesCount
      }
      if(!courses){
        
      }

      res.render('admin/admin', { courses,appInfo}); // Pass the topics and progress data to the topics view for rendering
    } catch (error) { 
      console.error('Error retrieving Courses:', error);
      res.status(500).send('An error occurred while retrieving the Courses.');
    }
});


router.get('/courses',verifyToken,isAdmin, async (req,res)=>{
  try {
    // Retrieve all topics from the database
    var coursesSearch = "";
    var allCourses = "";
    const searchQuery = req.query.search;
    let courses = await CourseModel.find({user:req.user._id});
    if( searchQuery && searchQuery.search("search")){
      console.log("search");
      coursesSearch = await CoursesController.courseSearch(req,res);
   
    }
    const allQuery = req.query.allcourses;
    if( allQuery && req.query.allcourses.search("allcourses") ){
      console.log("all");
      allCourses = courses
    }
   
    const categories = await CategoryModel.find().sort({ name: 1 });
    
    const coursesCount = await CourseModel.countDocuments() + 1;

    //get course data
    const coursesWithData = await CoursesController.coursesWithData(courses);

    const activeCourseCount = coursesWithData.filter(course => course.active).length;
    // Calculate the overall user count
    const overallUserCount = coursesWithData.reduce((count, course) => count + course.usersCount, 0);
    const stats = {
      activeCourseCount:activeCourseCount,
      overallUserCount:overallUserCount,
      coursesCount:courses.length
    }

    console.log(coursesWithData);
    courses = coursesWithData;
    res.render('admin/adminCourses', { courses,coursesCount,coursesSearch,allCourses,categories,stats}); // Pass the topics and progress data to the topics view for rendering
  } catch (error) { 
    console.error('Error retrieving Courses:', error);
    res.status(500).send('An error occurred while retrieving the Courses.');
  }
});

router.get('/settings',verifyToken,isAdmin, async (req,res)=>{
  try {
    let settings = await SettingsModel.findOne({user:"admin"});
    //get the categories
    const categories = await CategoryModel.find().sort({ name: 1 });
    if(!settings){
      settings = {};
    }
    res.render('admin/settings',{settings,categories});
  } catch (error) {
    console.log(error);
    
  }
});

router.post('/category',verifyToken,isAdmin, async (req,res)=>{
  try {
    console.log(req.body);
    let createCategory = {};
    if(req.body.name == null || req.body.name == ""){
      createCategory = {
        success: false,
        message: 'Empty field'
      };
    }else{
       createCategory = await CoursesController.createCategory(req.body.name.toLowerCase());
    }
   
   
    res.json(createCategory );
  
  } catch (error) {
    
  }
});

router.post('/createCourse',upload,verifyToken,isAdmin, async(req,res)=>{
  try {
    console.log("post");
    const createCourse = await CoursesController.createCourse(req);
    res.redirect('courses');
  } catch (error) {
    
  }

});

router.delete('/deleteCourse/:id', verifyToken,isAdmin, async(req,res)=> {  
  try {
    console.log(req.params.id);
    const deleteCourse = await CoursesController.deleteCourse(req.params.id);
    return res.json(deleteCourse);
    //return res.redirect('courses');
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
});

router.get('/category/remove/:id',verifyToken,isAdmin, async (req,res)=>{
  try {
    let settings = await SettingsModel.findOne({user:"admin"});
    const categories  = await CategoryModel.find();
    if(!settings){
      settings = {};
    }
    //get the categories
    
    if(req.params.id == null || req.params.id == ""){
      return res.redirect('/admin/settings');
    }

   //delete the category
    const deleteCategory = await CategoryModel.findByIdAndDelete(req.params.id);
    res.redirect('/admin/settings');
  } catch (error) {
    console.log(error);
    
  }
});

router.post('/settings', verifyToken,isAdmin, async(req,res)=> { 
  try {
    //check if admin settings exits
    if(req.body.percentage == null || req.body.percentage == ""){
        //render settings page
        const errors = [
          {
            type: 'field',
            value: '',
            msg: 'Empty fields',
            path: 'title',
            location: 'body'
          }
        ]
        return await SettingsController.renderSettingPage(req,res,errors);
    }else{
      const findSettings = await SettingsModel.countDocuments();
      if(findSettings > 0){
        //get the list of video sources and append the new value
        const newDATA = {
          passPercentage : req.body.percentage,
        }
        if(req.body.videoSource !== "" || req.body.videoSource !== null){
          //get the data 
          console.log("here");
          const settings = await SettingsModel.findOne({user:"admin"});
          let newList = [];
          newList = settings.videoSource.filter((video)=> video);
          newList.push(req.body.videoSource);
          newDATA.videoSource = newList;
          console.log(newDATA);
        }
        //update the settings
        await SettingsModel.findOneAndUpdate({user:"admin"},newDATA);
        return res.redirect("/admin/settings");
      }else{
        //create settings
        const newDATA = {
          user:"admin",
          passPercentage : req.body.percentage
        }
        if(req.body.videoSource == "" || req.body.videoSource == null){
          let newList = ['youtube','vimeo'];
          newDATA.videoSource = newList;
        }
        const settings = new SettingsModel(newDATA);
        await settings.save();
        return res.redirect("/admin/settings");
      }
    }
 
    
  } catch (error) {
    console.log(error);
  }
});

//router 



module.exports = router;    