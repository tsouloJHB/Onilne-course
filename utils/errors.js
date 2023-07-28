

const handleErrors = (err) =>{
    errors = [
        {
          type: 'field',
          value: '',
          msg: errorMessage,
          path: 'password',
          location: 'body'
        }
      ]
     //incorrect email
     if(err.message === 'Incorrect email'){
        errors.msg = 'Incorrect email or password';
    }

    //incorrect password
    if(err.message === 'Incorrect password'){
        errors.msg = 'Incorrect email or password';
    }

    //duplicate error code
    if(err.code === 11000){
        errors.msg= "That email is already registered";
        return errors;
    }
     //validation error
  
    return errors;
}   

module.exports = handleErrors;