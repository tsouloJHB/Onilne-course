
const multer = require('multer');
//post middleware
const Storage = multer.diskStorage({
    destination:"public/images/courseimages",
    filename : (req,file,cb) =>{
        cb(null,Date.now()+file.originalname);
        // cb(null,file.originalname);
    },
});


// Create a storage configuration for videos
const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Set the destination folder for video uploads
      cb(null, 'uploads/videos');
    },
    filename: function (req, file, cb) {
      // Set a unique filename for the uploaded video
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.mp4');
    }
  });   

  const videoUpload = multer({
    storage: videoStorage,
    limits: {
      fileSize: 1024 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only videos are allowed'));
      }
    }
  });

//"public/images/courseimages"
const upload = multer({
    storage:Storage,
    limits: {
        // Set the maximum file size to 5MB
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }  
}).single('imageUpload')


module.exports = {upload}