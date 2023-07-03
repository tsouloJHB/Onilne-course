const { checkSchema } = require("express-validator");



const topicCreateDataValidate = {
  topicTitle: {
   notEmpty: { errorMessage: "Topic title is required" },
 },
 topicDesc: {
   notEmpty: { errorMessage: "Topic description is required" },
 },
 materialTitle:{
  notEmpty: { errorMessage: "material title is required" },
 },
 materialContent: {
   notEmpty: { errorMessage: "Content is required" },
 },
 courseId: {
    notEmpty: { errorMessage: "CourseId is required" },
  },
//  courseVideo: {
//    notEmpty: { errorMessage: "Category is required" },
//    isURL: { errorMessage: "Please provide a valid course video URL" },
//  },
};



module.exports = {
 
    topicCreateDataValidate : checkSchema(topicCreateDataValidate),
        
};
