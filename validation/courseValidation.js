const { checkSchema } = require("express-validator");


const courseDataValidate = {
   title: {
    notEmpty: { errorMessage: "Title is required" },
  },
  courseDesc: {
    notEmpty: { errorMessage: "Course description is required" },
  },

  imageUpload: {
    custom: {
      options: (value, { req }) => {
        if (!req.file) {
          throw new Error("Image is required");
        }
        return true;
      },
    },
  },
  category: {
    notEmpty: { errorMessage: "Category is required" },
  },
  courseVideo: {
    notEmpty: { errorMessage: "Category is required" },
    isURL: { errorMessage: "Please provide a valid course video URL" },
  },
};


const courseEditDataValidate = {
  title: {
   notEmpty: { errorMessage: "Title is required" },
 },
 courseDesc: {
   notEmpty: { errorMessage: "Course description is required" },
 },
 category: {
   notEmpty: { errorMessage: "Category is required" },
 },
//  courseVideo: {
//    notEmpty: { errorMessage: "Category is required" },
//    isURL: { errorMessage: "Please provide a valid course video URL" },
//  },
};



module.exports = {
 
  courseDataValidate: checkSchema(courseDataValidate),
  courseEditDataValidate: checkSchema(courseEditDataValidate),
};
