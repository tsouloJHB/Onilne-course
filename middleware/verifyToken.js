const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and check expiration
function verifyToken(req, res, next) {
  const token = req.cookies.token || '';

  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

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
