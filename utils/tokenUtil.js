
const jwt = require('jsonwebtoken');

  const generateAuthToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'5d',
    });
};

module.exports = {generateAuthToken}