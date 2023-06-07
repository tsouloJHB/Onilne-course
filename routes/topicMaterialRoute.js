const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');


router.get('/courseOutline', verifyToken.verifyToken, (req, res) => {
  // Route handling code for course outline page
  res.render('courseOutline');
});

module.exports = router;