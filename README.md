## Online Learning Platform

### Description
The Online Learning Platform is a comprehensive web application that empowers users to create and customize their own unique learning journeys. With this platform, individuals can create courses, curate learning materials, and provide certifications upon course completion. Whether you're an educator, expert, or enthusiast, this platform allows you to share knowledge and facilitate learning in a personalized and engaging manner.

### Installation
1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd online-learning-platform`
3. Install dependencies: `npm install`

### Usage
1. Set up the environment variables by creating a `.env` file in the root directory.
2. Configure the following variables in the `.env` file:
   - `MONGO_URI`: Insert your MongoDB connection string.
   - `PORT`: Specify the port number for the server.
   - `JWT_SECRET`: Set a secret key for JWT token generation.
   - `REFRESH_TOKEN_SECRET`: Set a secret key for refresh token generation.
   - `SESSION_KEY`: Set a session key with a random string.
   - `SERVER_MAIL`: Insert a gmail account that has app password enabled /[IF NOT] insert random string.
   - `MAIL_PASSWORD`: Insert password for the gmail account [IF NOT] insert random string.
   - `SERVER_MAILS`: Insert a true or false value to enable the application to send emails using SERVER_MAIL, [IF ] random strings were used set the value to false.
3. Setup database : `node init-db`
   - An admin user will be created with the following credentials
      - email: `admin@example.com`
      - password: `1234567`
4. [OPTIONAL] Setup pre defined data : `node dummyData`
    - A user will be created with the following credentials
      - email: `johndoe@example.com`
      - password: `1234567`
3. Run the application: `npm start`
   - This command will start the server by executing the `server.js` file.
4. Access the application in your browser at `http://localhost:<PORT>`

### File Structure
- `controllers/`: Contains the controller logic for different routes and functionality.
- `models/`: Includes the MongoDB schema definitions for the application.
- `routes/`: Defines the routes and corresponding API endpoints for the application.
- `tests/`: Contains test files to ensure the functionality and integrity of the application.
- `utils/`: Includes utility functions and helper modules used throughout the application.
- `middleware/`: Contains middleware functions for authentication, error handling, etc.
- `public/`: Includes static assets such as CSS stylesheets and client-side JavaScript files.

### Contributing
Contributions to the Online Learning Platform are welcome! If you encounter any issues or have suggestions for improvement, please submit a bug report or open a pull request on the GitHub repository.

### License
This project is released under the [MIT License](https://opensource.org/licenses/MIT).

### Contact Information
For any further inquiries or information, please feel free to reach out to Thabangsoulo@gmail.com. You can also connect with me on [LinkedIn](https://www.linkedin.com/in/thabang-soulo) or visit my [GitHub profile](https://github.com/tsouloJHB).

Thank you for your interest in the Online Learning Platform!
