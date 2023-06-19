const connectDb = require('./db');
const User = require('./models/usersModel');


const doSome = async() =>{
    const user = new User({email:"admin@gmail.com",password:"1234567",name:"Admin",surname:"admin-admin",isAdmin:true})
    user.save();
  
}
doSome();
    