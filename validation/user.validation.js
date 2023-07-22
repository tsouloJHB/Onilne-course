const { check ,checkSchema } = require("express-validator");

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

const signUpSchemaValidator = checkSchema({
  name: {
    notEmpty: { errorMessage: 'Name is required' },
  },
  surname: {
    notEmpty: { errorMessage: 'Surname is required' },
  },
  email: {
    isEmail: { errorMessage: 'Please provide a valid email' },
  },
  password: {
    notEmpty: { errorMessage: 'Password is required' },
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password should be at least 6 characters',
    },
  },
  confirmpassword: {
    notEmpty: { errorMessage: 'Confirm Password is required' },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      },
    },
  },
});



module.exports = {
  userDataValidateSchemaBased: checkSchema(userDataValidateSchemaBased),
  loginDataValidate: checkSchema(loginDataValidate),
  signUpSchemaValidator,
};
