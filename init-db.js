const UserModel = require('./models/usersModel');
const SettingsModel = require('./models/settingsModel');
const CourseCategoriesModel = require('./models/courseCategories');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file



const email = "admin@example.com" //insert admin email address
const password = "1234567" //insert admin application password
const name = "John" // Replace with your name
const surname = "Doe" //Replace with your surname

async function initDatabase() {
  try {
    // Fetch MongoDB URI from environment variables
    const mongodbUri = process.env.MONGO_URI;
    
    // Connect to MongoDB
    await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    //create course categories collections
    await CourseCategoriesModel.createCollection();
    console.log('Categories Collection created ');
    // Create collections if they don't exist
    await UserModel.createCollection();
    console.log('User collection created');

    await SettingsModel.createCollection();
    console.log('Settings collection created');

    //create categories collection using the CourseCategories model
       // Create categories using the Category model
    const categories = ['Mathematics', 'AI', 'Design', 'Business'];
    for (const categoryName of categories) {
      const category = new CourseCategoriesModel({
        name: categoryName,
      });
      await category.save();
      console.log(`Category '${categoryName}' created.`);
    }


    // Create an admin user using the User model
    const adminUser = new UserModel({
      email: email,
      password: password, // Password will be hashed automatically due to pre-save hook
      name: name,
      surname: surname,
      isAdmin: true,
    });

    await adminUser.save();
    console.log('Admin user created successfully.');

    // Create settings using the Settings model
    const initialSettings = new SettingsModel({
      logo: 'path/to/logo.png',
      passPercentage: 70,
      siteIntroDesc: 'Welcome to our site!',
      user: 'admin', 
      videoSource: ['youtube', 'vimeo','googledrive'],
      // Add more settings as needed
    });

    await initialSettings.save();
    console.log('Initial settings created successfully.');

  } catch (error) {
    console.error('Error initializing the database:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Call the initDatabase function to start initialization
initDatabase();
