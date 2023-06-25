const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Please enter an email"],
        unique:true,
        lowercase:true,
        // Validate:[isEmail,"Please enter valid email"]     
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        minlength:[6,"Minimum password length is 6 characters"]
    },
    name:{
        type:String,
        required:[true,"Please enter a name"],
        max:50
    },
    surname:{
        type:String,
        required:[true,"Please enter a surname"],
        max:50
    },
    city:{
        type:String,
        max:50
    },
    country:{
        type:String,
        max:50
    },
    cell:{
        type:String,
        max:11
    },
    countryCode:{
        type:String,
        max:11
    },
    image:{
        data:Buffer,
        contentType:String
    },
    online:{
        type:Boolean,
        default:false,
    },
    userProgress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProgress'
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    
    
},
{ timestamps: true }  
);
userSchema.pre('save', async function (next) {
    try {
      if (!this.isModified('password')) {
        return next();
      }
  
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
  
      next();
    } catch (error) {
      next(error);
    }
  });
  
  // Generate JWT token

  userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '5d' });
    return token;
  };
  
  // Static method to login user
  userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      }
      throw Error('Incorrect password');
    }
    throw Error('Incorrect email');
  };
  



const User = mongoose.model('user',userSchema);
module.exports = User;