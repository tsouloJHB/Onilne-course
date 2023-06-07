// Import required modules
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDb = require('./db')
const userRouter = require('./routes/userRoute');
const cookieParser = require('cookie-parser');
const topicsRouter = require('./routes/topicsRoute');
const topicMaterialRoute = require('./routes/topicMaterialRoute');
// const User = require('./models/users');
// const Topic = require('./models/topic');
// const TopicMaterial = require('./models/TopicMaterial');

dotenv.config();
connectDb();
const bodyParser = require('body-parser');

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
app.use('/users', userRouter);
app.use('/topics', topicsRouter);
app.use('/topicOutline', topicMaterialRoute);

// Testing the models

// const user = new Topic({title:'Algebra first year level',topicNo:1,topicDesc:"crash course Algebra for stat to finish"})
// user.save();

// const topic = new Topic({ title: 'Node.js Basics' });
// topic.save();

// const topicMaterial = new TopicMaterial({ title: 'Introduction', content: 'This is an introduction to Node.js', topic: topic._id });
// topicMaterial.save();

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

app.get('/', (req, res) => {
  res.render('home');
});








module.exports = app;
