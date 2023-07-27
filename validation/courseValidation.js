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
 
  difficulty: {
    notEmpty: { errorMessage: "difficulty is required" },
  },
  prerequisites: {
    notEmpty: { errorMessage: "prerequisites is required" },
  },
  language: {
    notEmpty: { errorMessage: "language is required" },
  },
  hours: {
    notEmpty: { errorMessage: "hours is required" },
  },
  
 material: {
    notEmpty: { errorMessage: "material is required" },
  }
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

};



module.exports = {
 
  courseDataValidate: checkSchema(courseDataValidate),
  courseEditDataValidate: checkSchema(courseEditDataValidate),
};
