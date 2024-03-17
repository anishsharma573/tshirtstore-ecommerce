const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name:{
       type:String,
       required:[true,"Please Enter the Name"],
       maxlength:[40,"Name Length should be less than 40 Characters"]
    },
    email:{
       type:String,
       required:[true,"Please Enter the Email"],
       validate:[validator.isEmail,"Please Enter a Email in the correct Format "],
       unique :true
    },
    password:{
       type:String,
       required:[true,"Please Enter the Password"],
       minlength:[6,"Password should have atleast 6 characters"]
    },
    role:{
       type:String,
      default:'user'
    },
    photo:{
      id:{
        type:String,
        required:true
      },
      secure_url:{
        type:String,
      required:true
      }
    },
    forgetPasswordToken:String,
    forgetPasswordExpiry:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
})
// encryption password before save - HOOKS
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }

    this.password= await bcrypt.hash(this.password,10)
})


//methods 
userSchema.methods.isValidatedPassword=async function(userSendPassword){
    return await bcrypt.compare(userSendPassword,this.password)

}


//creating jwt token 


userSchema.methods.getJwtToken =   function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRY
    })
}


//create  forget password token(string )

userSchema.methods.forgotPasswordToken= function(){
 //generate long and random string

 const forgotToken = crypto.randomBytes(20).toString('hex')

 ///get a hash on the backend as well
 this.forgetPasswordToken=crypto
 .createHash('sha256')
 .update(forgotToken)
 .digest('hex')

 //time of the token
 this.forgetPasswordExpiry = Date.now() + 30*60*1000

 return forgotToken
}
module.exports = mongoose.model("User",userSchema)  