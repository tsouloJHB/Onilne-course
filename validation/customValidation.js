

const validateCreateQuiz = async(req,res,next) =>{
    try {
        const { topicId, questions } = req.body;
        req.body.errors = false;
      
        questions.forEach(question => {
            if(question.question == ""){
                console.log("error");
                req.body.errors = true;
                //throw Error("question is required");

            }
            if(question.answer == ""){
                req.body.errors = true;
                //throw Error("answer is required");

            }
            if(question.incorrectAnswer1 == ""){
                req.body.errors = true;
                //throw Error("incorrect answer is required");

            }
            if(question.incorrectAnswer2 == ""){
                req.body.errors = true;
                //throw Error("incorrect answer 2 is required");

            }
        });
        next();
    } catch (error) {
       // console.log(error);
        next();
    }
}

const validateQuizTest = async(req,res,next) =>{
    try {
        const {answer } = req.body;
        req.body.errors = false;
        console.log(answer);
        answer.forEach(ans => {
          
            if(ans == ""){
                req.body.errors = true;
                //throw Error("answer is required");
                
            }
           
        });
        next();
    } catch (error) {
       // console.log(error);
        next();
    }
}

module.exports = {
    validateCreateQuiz,
    validateQuizTest
}