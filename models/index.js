const CourseModel = require('./coursesModel');
const TopicModel = require('./topicModel');
const TopicMaterialModel = require('./topicMaterialModel');
const TopicQuizModel = require('./topicQuizModel');
const UserModel = require('./usersModel');
const UserProgressModel = require('./userProgressModel');
const CategoryModel = require('./courseCategories');

module.exports = {
    CourseModel,
    TopicMaterialModel,
    TopicModel,
    TopicQuizModel,
    UserModel,
    UserProgressModel,
    CategoryModel
};