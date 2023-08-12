
const {ActionsModel} = require('../models');

exports.onLoginCheckActions = async(user) =>{
    let response  = {
        status:false,
        data:"",
        type:""
    }
    try { 
  
      const action = await ActionsModel.findOne({user});
      if(action){
        response.status = true;
        response.data = action.data;
        response.type = action.type;
        //delete the user action
        await ActionsModel.findByIdAndDelete(action._id);
      } 
      return response
      
    } catch (error) {
      console.log(error);
      return response;
 
    }  
}

exports.setLoginActions = async(type,data,user) =>{
    try { 
  
        const action = new ActionsModel ({ user, type,data });
        action.save();
        return true  
      
    } catch (error) {
      console.log(error);
      return false;
      
    }  
}
  