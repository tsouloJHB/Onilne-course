const mongoose = require('mongoose');
require('dotenv').config(); 
const CourseModel = require('./models/coursesModel');
const CourseCategoriesModel = require('./models/courseCategories');
const UserModel = require('./models/usersModel');
const TopicModel = require('./models/topicModel');
const TopicMaterialModel = require('./models/topicMaterialModel');
const TopicQuizModel = require('./models/topicQuizModel');



async function createDummyData() {
  try {
    // Fetch MongoDB URI from environment variables
    const mongodbUri = process.env.MONGO_URI;

    // Connect to MongoDB
    await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create courses using the Courses model
    const adminUserId = 'your-admin-user-id'; // Replace with the actual admin user ID

    //get categories data 
    const category = await CourseCategoriesModel.find();
    // get admin Id
    const admin = await UserModel.findOne({isAdmin:true});

    const dummyCourses = [
      {
        title: 'Introduction to Mathematics',
        courseNo: 1,
        user: admin._id,
        courseDesc: 'Learn the basics of mathematics.',
        active: true,
        courseImage:"/images/courseimages/resized_1693074761227444e5ae4-776c-4318-8a4d-566072d3083f.png",
        hours:12,
        category: category[0]._id, // Replace with the actual category ID
        // Add more course data
      },
      {
        title: 'Machine learning',
        courseNo: 2,
        user: admin._id,
        courseDesc: 'Discover the world of artificial intelligence.',
        active: true,
        courseImage:"/images/courseimages/resized_1693074844992machine-learning-banner-2.png",
        hours:12,
        category: category[1]._id, // Replace with the actual category ID
        // Add more course data
      },
      {
        title: 'Graphic Design',
        courseNo: 3,
        user: admin._id,
        courseDesc: 'Discover the world of Graphic design.',
        active: true,
        courseImage:"/images/courseimages/resized_1693074782205graphic-design.png",
        hours:8,
        category: category[2]._id, // Replace with the actual category ID
      }
       
      // Add more dummy courses
    ];

    const createdCourses = await CourseModel.create(dummyCourses);

    //create lessons for each course
    const mathCourse = await CourseModel.findOne({title:"Introduction to Mathematics"});
    const aiCourse = await CourseModel.findOne({title:"Machine learning"});
    const designCourse = await CourseModel.findOne({title:"Graphic Design"});
    
    await createTopics(mathCourse,aiCourse,designCourse);
    // console.log('Dummy courses created successfully:', createdCourses);

    //create lessons for each course


  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

async function createTopics(mathCourse,aiCourse,designCourse) {
 try {
   const mathTopic = await new TopicModel({
     title: 'Algebra', // Example title
     topicNo: 1, // Example topic number
     topicDesc: 'Welcome to the Alegebra', // Example topic description
     courseId: mathCourse._id, // Reference to the course
   }).save();
   //create topic material
 
   //mathTopic.save();
    const aiTopic = await new TopicModel({
     title: 'Neural Networks', // Example title
     topicNo: 1, // Example topic number
     topicDesc: 'Welcome to the Neural Networks', // Example topic description
     courseId: aiCourse._id, // Reference to the course
   }).save();
  
   const designTopic = await new TopicModel({
     title: 'Photoshop', // Example title
     topicNo: 1, // Example topic number
     topicDesc: 'Welcome to theGraphic design', // Example topic description
     courseId: designCourse._id, // Reference to the course
   }).save();

   //create topic content 
   await createTopicsContent(mathTopic,aiTopic,designTopic);
   //create topic quiz
   await createQuiz(mathTopic,aiTopic,designTopic);
 } catch (error) {
    console.log(error);
 }
}

async function createTopicsContent(mathTopic,aiTopic,designTopic) {
  const mathContent = await new TopicMaterialModel({
    title: 'Algebra', // Example title
    content: `Algebra  reunion of broken parts, bonesetting (listen) is the study of variables and the rules for manipulating these variables in formulas it is a 
    unifying thread of almost all of mathematics.Elementary algebra deals with the manipulation of variables (commonly represented by Roman letters) as if they were 
    numbers and is therefore essential in all applications of mathematics. Abstract algebra is the name given, mostly in education, to the study of algebraic structures 
    such as groups, rings, and fields. Linear algebra, which deals with linear equations and linear mappings, is used for modern presentations of 
    geometry, and has many practical applications (in weather forecasting, for example). There are many areas of mathematics that belong to 
    algebra, some having algebra in their name, such as commutative algebra, and some not, such as Galois theory.
    The word algebra is not only used for naming an area of mathematics and some subareas; it is also used for naming some sorts of algebraic 
    structures, such as an algebra over a field, commonly called an algebra. Sometimes, the same phrase is used for a subarea and its main
     algebraic structures; for example, Boolean algebra and a Boolean algebra. A mathematician specialized in algebra is called an algebraist.`,
   
  
    topicId: mathTopic._id, 
    topicVideo:"https://www.youtube.com/embed/grnP3mduZkM"
  }).save();

  const designContent = await new TopicMaterialModel({
    title: 'Neural Networks', // Example title
    content: `Even if you've never worked with images on your computer, you may have heard of Adobe Photoshop. 
    Available for both Windows and Mac, Adobe Photoshop is an extremely powerful application that's used by many professional photographers
    and designers. You can use Photoshop for almost any type of image editing, from touching up photos to creating high-quality graphics.`,
   
  
    topicId: designTopic._id, 
    topicVideo:"https://www.youtube.com/embed/w8yWXqWQYmU"
  }).save();
  const aiContent = await new TopicMaterialModel({
    title: 'Neural Networks', // Example title
    content: `A neural network is a method in artificial intelligence that teaches computers to process data in a way
     that is inspired by the human brain. It is a type of machine learning process, called deep learning, that uses interconnected
      nodes or neurons in a layered structure that resembles the human brain. It creates an adaptive system that computers use to
       learn from their mistakes and improve continuously. Thus, artificial neural networks attempt to solve complicated problems,
        like summarizing documents or recognizing faces, with greater accuracy.`,
   
  
    topicId: aiTopic._id, 
    topicVideo:"https://www.youtube.com/embed/IyR_uYsRdPs"
  }).save();
}

async function createQuiz(mathTopic,aiTopic,designTopic) {
     // Create a new quiz question for the topic
    try {
       const mathQuestion = await new TopicQuizModel({
        topicId: mathTopic._id,
        questions: [
          {
            question: 'What is Algebra?', // Example question
            answer: 'Algebra is the study of variables and the rules for manipulating these variables in formulas', // Example correct answer
            incorrectAnswer1: 'The branch of mathematics concerned with specific functions of angles and their application to calculations.', // Example incorrect answer
            incorrectAnswer2: 'The mathematical study of continuous change, in the same way that geometry is the study of shape', // Example incorrect answer
          },
          // Add more questions as needed
        ],
      }).save();
      const aiQuestion = await new TopicQuizModel({
        topicId: aiTopic._id,
        questions: [
          {
            question: 'What is neural networks ?', // Example question
            answer: 'A branch of machine learning models that are built using principles of neuronal organization discovered by connectionism in the biological neural networks constituting animal brains', // Example correct answer
            incorrectAnswer1: 'Are mathematical descriptions of the properties of certain cells in the nervous system that generate sharp electrical potentials across their cell membrane,.', // Example incorrect answer
            incorrectAnswer2: 'The mathematical study of continuous change, in the same way that geometry is the study of shape', // Example incorrect answer
          },
          // Add more questions as needed
        ],
      }).save();
      const designQuestion = await new TopicQuizModel({
        topicId: designTopic._id,
        questions: [
          {
            question: 'What is Photoshop ?', // Example question
            answer: 'Adobe Photoshop is a raster graphics editor developed and published by Adobe Inc. for Windows and macOS', // Example correct answer
            incorrectAnswer1: 'Is a vector graphics editor and design program developed and marketed by Adobe Inc', // Example incorrect answer
            incorrectAnswer2: 'Is a desktop publishing and page layout designing software application produced by Adobe Inc.', // Example incorrect answer
          },
          // Add more questions as needed
        ],
      }).save();
    } catch (error) {
      console.log(error);
    }
}
// Call the createDummyData function to create dummy data
createDummyData();