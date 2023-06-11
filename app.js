// Import required modules
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDb = require('./db')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { AdminRoute,CourseRoute,TopicMaterialRoute,TopicsRoute,UserRoute} = require('./routes');
const User = require('./models/userProgressModel');
const UserProgress = require('./models/userProgressModel');
const Course =  require('./models/coursesModel');
const Topic = require('./models/topicModel');
// const TopicMaterial = require('./models/TopicMaterial');
const Courses = require('./models/coursesModel');
app.use(cors());
dotenv.config();
connectDb();
const bodyParser = require('body-parser');
const { UserModel } = require('./models');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));



// Middleware
// Parse URL-encoded bodies for form data
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies for API requests
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/users', UserRoute);
app.use('/topics', TopicsRoute);
app.use('/topicOutline', TopicMaterialRoute);
app.use('/course',CourseRoute);
app.use('/admin',AdminRoute);


// Testing the models

// const user = new Topic({title:'Algebra first year level',topicNo:1,topicDesc:"crash course Algebra for stat to finish"})
// user.save();
// const dosome = async() =>{
//   const user = await UserModel.findOne({ email: "0784939@gmail.com" });
//   const course = await Course.findOne({ courseNo: 1 });
//   const topic = await Topic.findOne({ courseId: course._id, topicNo: 1 });
  
//   if (user && course && topic) {
//     const progress = new UserProgress({
//       user: user._id,
//       course: course._id,
//       topic: topic._id,
//       progress: 1, // Set the initial progress value as desired
//     });
  
//     progress.save();
//   } else {
//     console.log('User, course, or topic not found.');
//   }
  
// }
// dosome();





// const topic = new Topic({ title: 'Node.js Basics' });
// topic.save();
  // const top = new Courses({ title: 'Mathematics',courseNo:1,courseDesc:"This course covers an introduction to mathematics" });
  // top.save();
  // const topic = new Topic({title:'Algebra first year level',topicNo:1,topicDesc:"crash course Algebra for stat to finish", courseId:top._id})
  // topic.save();
  // const addmore = async() =>{
  //   const topic = await Topic.findOne({topicNo:2});
  // // const topic1 = new Topic({title:'Introduction to Trigonometry',topicNo:2,topicDesc:"crash course Trigonometry for stat to finish", courseId:top._id})
  // // topic1.save();

  // const topicMaterial = new TopicMaterial({ title: 'Introduction to Trigonometry', content: 'Trigonometry', topicId: topic._id, topicVideo:"https://www.youtube.com/watch?v=PUB0TaZ7bhA" });
  // topicMaterial.save();
  // }

  

// Define routes4


// async function createDummyData() {
//   try {
//     // Find a topic from the database
//     const topic = await Topic.findOne();

//     // Create a new topic material
//     const topicMaterial = new TopicMaterial({
//       title: topic.title,
//       content: 'Dummy Content gfd gfd dfg g fdg dfg gr fd sdfr the stuff is here ',
//       topicId: topic._id, // Assign the topic's _id to the topicId field
//       topicVideo: 'Dummy Video URL',
//     });

//     // Save the topic material
//     const savedTopicMaterial = await topicMaterial.save();

//     console.log('Dummy data created:', savedTopicMaterial);
//   } catch (error) {
//     console.error('Error creating dummy data:', error);
//   } finally {
//     // Disconnect from the database
  
//   }
// }

// // Call the function to create dummy data
// createDummyData();

//get the courses and 

app.get('/', async(req, res) => {
  const courses  = await Courses.find();
  res.render('home', { courses});
});








module.exports = app;
