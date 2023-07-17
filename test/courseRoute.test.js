const request = require('supertest');
const { UserProgressModel,TopicModel,CourseModel, TopicMaterialModel, CategoryModel } = require('../models');
const app = require('../app'); // Replace with the path to your app file
const verifyToken = require('../middleware/verifyToken');




jest.mock('../models/coursesModel.js');
jest.mock('../models/topicModel.js');
jest.mock('../models/userProgressModel.js');

describe('POST /register endpoint', () => {
  it('should redirect to /users if userCourse exists', async () => {
    const mockUserCourse = [{ _id: 'courseId' }];
    CourseModel.find.mockResolvedValue(mockUserCourse);

    const response = await request(app)
      .post('/register')
      .send({ courseId: 'courseId' })
      .expect(302);

    expect(response.header.location).toBe('/users');
  });

//   it('should redirect to /course/user if userCourse does not exist', async () => {
//     CourseModel.find.mockResolvedValue([]);

//     const mockTopic = { _id: 'topicId' };
//     TopicModel.findOne.mockResolvedValue(mockTopic);

//     UserProgressModel.prototype.save = jest.fn();

//     const response = await request(app)
//       .post('/register')
//       .send({ courseId: 'courseId' })
//       .expect(302);

//     expect(response.header.location).toBe('/course/user');
//     expect(UserProgressModel.prototype.save).toBeCalledWith();
//   });

//   it('should render 404 page if an error occurs', async () => {
//     CourseModel.find.mockRejectedValue(new Error('Database error'));

//     const response = await request(app)
//       .post('/register')
//       .send({ courseId: 'courseId' })
//       .expect(200);

//     expect(response.text).toContain('An error occurred while retrieving');
//   });
});
