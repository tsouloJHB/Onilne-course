const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    incorrectAnswer1: {
      type: String,
      required: true
    },
    incorrectAnswer2: {
      type: String,
      required: true
    }
  }]
});

const topicQuiz = mongoose.model('topicQuiz', quizSchema);

module.exports = topicQuiz;
