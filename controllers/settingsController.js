const { SettingsModel } = require("../models");

module.exports.renderSettingPage = async(req,res,errors) =>{
    try {
        let settings = await SettingsModel.findOne({user:"admin"});
        if(!settings){
          settings = {};
        }
        res.render('admin/settings',{settings,errors});
      } catch (error) {
        console.log(error);
        
      }
}