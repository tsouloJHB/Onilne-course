const jwt = require('jsonwebtoken');
const User = require('../models/users');
// Middleware to verify JWT token and check expiration
async function verifyToken(req, res, next) {
  const token = req.cookies.token || '';

  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    req.id = decoded;
    
    req.user = await User.findById(decoded.id.id).select('-password');
    // Check if token has expired
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp < nowInSeconds) {
      throw new Error('Token has expired');
    }

    next();
  } catch (err) {
    console.log(err);
    res.redirect('users/login');
  }
}
module.exports = {verifyToken};
