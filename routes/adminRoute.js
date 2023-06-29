const express = require('express');
const router = express.Router();
const {verifyToken, isAdmin} = require('../middleware/verifyToken');
const { CourseModel, CategoryModel, UserModel, SettingsModel } = require('../models');
const { CoursesController } = require('../controllers');
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
   
    const categories =  await CategoryModel.find();
    
    const coursesCount = await CourseModel.countDocuments() + 1;

    //get course data
    const coursesWithData = await CoursesController.coursesWithData(courses);
    console.log(coursesWithData);
    courses = coursesWithData;
    res.render('admin/adminCourses', { courses,coursesCount,coursesSearch,allCourses,categories}); // Pass the topics and progress data to the topics view for rendering
  } catch (error) { 
    console.error('Error retrieving Courses:', error);
    res.status(500).send('An error occurred while retrieving the Courses.');
  }
});

router.get('/settings',verifyToken,isAdmin, async (req,res)=>{
  try {
    let settings = await SettingsModel.findOne({user:"admin"});
    if(!settings){
      settings = {};
    }
    res.render('admin/settings',{settings});
  } catch (error) {
    console.log(error);
  
  }
});

router.post('/category',verifyToken,isAdmin, async (req,res)=>{
  try {
    console.log(req.body);
    const createCategory = await CoursesController.createCategory(req.body.name);
    if(createCategory){
      res.json(createCategory );
    }else{
      res.json(createCategory );
    }    
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

router.post('/settings', verifyToken,isAdmin, async(req,res)=> { 
  try {
    //check if admin settings exits
    const findSettings = await SettingsModel.countDocuments();
    if(findSettings > 0){
      //update the settings
      await SettingsModel.findOneAndUpdate({user:"admin",passPercentage:req.body.percentage});
      return res.redirect("/admin/settings");
    }else{
      const settings = new SettingsModel({
        passPercentage:req.body.percentage,
        user:"admin"
      });
      await settings.save();
      return res.redirect("/admin/settings");
    }
    
  } catch (error) {
    console.log(error);
  }
});

//router 



module.exports = router;    