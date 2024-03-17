const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");
const { response } = require("express");
exports.signUp = BigPromise(async (req, res, next) => {
    try {
        if (!req.files) {
            throw new CustomError("Photos are required for signUp", 400);
        }

        const file = req.files.photo;
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: 'users',
            width: 150,
            crop: 'scale'
        });

        const { name, email, password } = req.body;

        if (!email || !name || !password) {
            throw new CustomError("Name, email, and password are required for SignUp", 400);
        }

        const user = await User.create({
            name,
            email,
            password,
            photo: {
                id: result.public_id,
                secure_url: result.secure_url
            }
        });

        cookieToken(user, res);
    } catch (error) {
        next(error);
    }
});

exports.login = BigPromise(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new CustomError('Please provide email and password', 400);
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new CustomError('You are not registered', 400);
        }

        const isPasswordCorrect = await user.isValidatedPassword(password);

        if (!isPasswordCorrect) {
            throw new CustomError('Email or Password does not match', 400);
        }

        cookieToken(user, res);
    } catch (error) {
        next(error);
    }
});

exports.logout = BigPromise(async (req, res, next) =>{
res.cookie('token',null,{
    expires:new Date(Date.now()),
    httpOnly:true
})
res.status(200).json({
    success:true,
    message:"Logout success"
})
});

exports.forgotPassword = BigPromise(async (req, res, next) =>{
const {email}= req.body
const user = await User.findOne({email})
if(!user){
    return next(new CustomError("Email not found as registered ",500))
}
const forgotToken = user.forgotPasswordToken()

await user.save({validateBeforeSave:false})

const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;


const message =`COpy paste this link in your Url and hit enter \n\n ${myUrl}`

try {
    await mailHelper({
        email:user.email,
        subject:"USER_PASSWORD_REST- password rest email",
        message,
      

    })
    res.status(200).json({
        success:true,
        message:"Email sent successfully"
    })
} catch (error) {
  user.forgetPasswordToken = undefined
  user.forgetPasswordExpiry = undefined
  await user.save({validateBeforeSave:false})
  return next(new CustomError(error.message,500))
}

});

exports.passwordReset = BigPromise(async (req, res, next) => {
    const token = req.params.token;

    const encryptToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find the user by the hashed token and check if the token is still valid
    const user = await User.findOne({
        forgetPasswordToken: encryptToken,
        forgetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(new CustomError('Token is invalid or expired', 400));
    }

    // Check if the passwords match
    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError('Password and confirmPassword do not match', 400));
    }

    // Update the user's password and reset forget password fields
    user.password = req.body.password;
    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiry = undefined;

    // Save the changes to the user
    await user.save();

    // Send a response or token
    cookieToken(user, res);
});


exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
const user = await User.findById(req.user.id)
res.status(200).json({
    success:true,
    user
})
});

exports.changePassword = BigPromise(async (req, res, next) =>{
    const  userId  = req.user.id

  const user = await  User.findById(userId).select("+password")
    

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)
   
    
    if(!isCorrectOldPassword){
        return next(new CustomError('Old password is incorrect ',400))

    }

    user.password =req.body.newPassword

    await user.save()

    cookieToken(user,res)
});

exports.updateUserDetails = BigPromise(async (req, res, next) =>{

    const newData ={
        name:req.body.name,
        email:req.body.email,

    };
     
if (req.files) {
    const user = await User.findById(req.user.id)
    const imageId = user.photo.id
//delete photo
    const response = await cloudinary.v2.uploader.destroy(imageId)
    
//upload the new photo
    const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
        folder: 'users',
        width: 150,
        crop: 'scale'
    });
    newData.photo={
        id:result.public_id,
        secure_url:result.secure_url
    }
}
    const user = await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        user
    })
})


exports.adminALlUser = BigPromise(async (req, res, next) =>{

const users = await User.find()
res.status(200).json({
    success:true,
    users,
})
})


exports.adminGetOneUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new CustomError('No user Found', 400));
    }

    // Use a custom replacer function to handle circular references
    const jsonString = JSON.stringify(user, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (value instanceof User) {
                // If the value is an instance of the User model, exclude it from serialization
                return undefined;
            }
        }
        return value;
    });

    const parsedUser = JSON.parse(jsonString);

    res.status(200).json({
        success: true,
        user: parsedUser,
    });
});


exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) =>{

    const newData ={
        name:req.body.name,
        email:req.body.email,
         role:req.body.role
    };
     

    const user = await User.findByIdAndUpdate(req.params.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        user
    })
});

exports.adminDeleteOneUserDetails = BigPromise(async (req, res, next) => {
    const userId = req.params.id;

    // Use findById to get the user details
    const user = await User.findById(userId);

    if (!user) {
        return next(new CustomError("No such User is found", 401));
    }

    const imageId = user.photo.id;

    // Use deleteOne to remove the user by ID
    await User.deleteOne({ _id: userId });

    // Delete the image from Cloudinary
    await cloudinary.v2.uploader.destroy(imageId);

    res.status(200).json({
        success: true,
    });
});




exports.manageAllUser = BigPromise(async (req, res, next) =>{
    const users = await User.find({role:"user"})
    res.status(200).json({
        success:true,
        users,
    })

})