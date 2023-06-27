const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { TopicModel, TopicMaterialModel,TopicQuizModel, UserProgressModel } = require('../models');

router.post('/submit',verifyToken.verifyToken, async (req, res) => {
    try {
        const { topicId, answer } = req.body;
        
        //check if user has already completed the quiz
        //console.log(topicId)
        const userProgress = await UserProgressModel.findOne({user:req.user._id,topic:topicId});
        //for, validation
        if(topicId == null || answer == null){
            return res.redirect(req.headers.referer);
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
            if(markPercentage > 70){
                //set course as complete
               
                //get the next topic
                
                const newTopicNumber = currentTopic.topicNo+1;
                const topicCount = await TopicModel.countDocuments({courseId:currentTopic.courseId});
                console.log(newTopicNumber);
                console.log(topicCount);
                if(newTopicNumber <= topicCount){
                  const nextTopic = await TopicModel.findOne({topicNo:newTopicNumber,courseId:currentTopic.courseId});
                  await UserProgressModel.findOneAndUpdate({user:req.user._id,course:currentTopic.courseId,progress:newTopicNumber,topic:nextTopic._id});
                  response = {
                    mark:markPercentage+"%",
                    message:"You have successfully completed the quiz",
                    nextTopic:nextTopic._id
                }
                }else{
                //set the course as complete 
                
                if(userProgress.progress == topicCount ){
                  await UserProgressModel.findOneAndUpdate({user:req.user._id,completed:true});    
                }
            
                response = {
                  mark:markPercentage+"%",
                  message:"You have successfully completed the quiz",
                  nextTopic:currentTopic._id
              }
                }
               
             
            }else{
                //set course as incomplete 
                 response = {
                    mark:markPercentage+"%",
                    message:"You received less than 70% , you may return back to the topic",
                    nextTopic:""
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