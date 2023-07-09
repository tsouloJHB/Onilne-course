const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const QuizService = require('../services/quizService');
const { TopicModel, TopicMaterialModel,TopicQuizModel, UserProgressModel, SettingsModel } = require('../models');
const { CoursesController } = require('../controllers');

router.post('/submit',verifyToken.verifyToken, async (req, res) => {
    try {
        const { topicId, answer } = req.body;
        
        //check if user has already completed the quiz
        //console.log(topicId)
        const userProgress = await UserProgressModel.findOne({user:req.user._id,topic:topicId});
        //for, validation
        if(topicId == null || answer == null){
            console.log("errors boy");
            return res.redirect(req.headers.referer+"?error=No answer submitted");
        }
          //get current topic
        const currentTopic = await TopicModel.findById(topicId);
        if(!userProgress){
          
            return res.redirect('/topicOutline/material/'+topicId);  
        
        }
      
        //get the quiz
        const quizzers = await TopicQuizModel.findOne({topicId});
        let mark = 0;
        if (quizzers) {
            //console.log(quizzers.questions.length);
            quizzers.questions.forEach((question, index) => {
              if(question.answer == answer[index]){
                mark++
              }
            });
       
            //get percentage of the mark
            const markPercentage = (mark / quizzers.questions.length) * 100;
            let response = {};
            //get pass percentage
            const settings = await SettingsModel.findOne({user:"admin"});
            let percentage = 70;
            if(settings){
              percentage = settings.passPercentage
            }   
            if(markPercentage > percentage){
                //set course as complete
               
                //get the next topic
                
                const newTopicNumber = currentTopic.topicNo+1;
                const topicCount = await TopicModel.countDocuments({courseId:currentTopic.courseId});
                if(newTopicNumber <= topicCount){
                  const nextTopic = await TopicModel.findOne({topicNo:newTopicNumber,courseId:currentTopic.courseId});
                  await UserProgressModel.findOneAndUpdate({user:req.user._id,course:currentTopic.courseId,progress:newTopicNumber,topic:nextTopic._id});
                  response = {
                    mark:markPercentage+"%",
                    message:"You have successfully completed the quiz",
                    nextTopic:nextTopic._id,
                    success:true
                }
                }else{
                //set the course as complete        
                if(userProgress.progress == topicCount ){
                  //generate certificate 
                  //Get course info
                  const creator = await CoursesController.getCourseCreator(currentTopic.courseId);
                  //certificate link
                  const link = await QuizService.createCertificate(req.user.name,req.user.surname,creator.user.name,creator.course.title);
                  //const link = "images/certificates/43244.png";
                  await UserProgressModel.findOneAndUpdate({user:req.user._id,completed:true,certificate:link});    
                }
            
                response = {
                  mark:markPercentage+"%",
                  message:"You have successfully completed the quiz",
                  nextTopic:currentTopic._id,
                  success:true
              }
                }
               
             
            }else{
                //set course as incomplete 
                 response = {
                    mark:markPercentage+"%",
                    message:"You received less than "+percentage+"% , you may return back to the topic",
                    nextTopic:"",
                    success:false
                }
            
                console.log("You have failed");
            }
           return res.render('quizTest', {  quiz:quizzers ,topicId,response}); 
        } 
      res.redirect('/topicOutline/quiz/'+topicId);  
    } catch (error) {
      console.log(error);
    }
});


module.exports = router;