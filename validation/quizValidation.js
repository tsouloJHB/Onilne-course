const { checkSchema } = require("express-validator");

const quizCreateDataValidate = {
   questions: {
   notEmpty: { errorMessage: "Question is required" },
 },
};



module.exports = {
    quizCreateDataValidate : checkSchema(quizCreateDataValidate),  
};
