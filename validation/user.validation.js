const { checkSchema } = require("express-validator");

const userDataValidateSchemaBased = {
  userName: {
    exists: {
      errorMessage: "User name is required",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "User name should be a string" },
  },
  password: {
    exists: { errorMessage: "Password is required" },
    isString: { errorMessage: "Password should be a string" },
    isLength: {
      options: { min: 7 },
      errorMessage: "Password should be at least 7 characters",
    },
  },
  email: {
    isEmail: { errorMessage: "Please provide a valid email" },
  },
  cell: {
    isString: { errorMessage: "Phone number should be a string" },
  },
};

const loginDataValidate = {
  password: {
    notEmpty: { errorMessage: "Password is required" },
   
  },
  email: {
    notEmpty: { errorMessage: "Email is required" },
   
    isEmail: { errorMessage: "Please provide a valid email" },
  },
};

module.exports = {
  userDataValidateSchemaBased: checkSchema(userDataValidateSchemaBased),
  loginDataValidate: checkSchema(loginDataValidate),
};
