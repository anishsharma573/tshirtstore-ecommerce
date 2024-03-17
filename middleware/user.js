const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    let token;

    // Check if the token is present in cookies
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        // Check if the token is present in the Authorization header
        token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
        return next(new CustomError('Login First to access this Page', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user to the request object
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new CustomError('User not found', 401));
        }

        next();
    } catch (error) {
        return next(new CustomError('Invalid Token', 401));
    }
});

exports.customRole=(...roles)=>{
   return(req,res,next)=>{
    if(!roles.includes(req.user.role)){
  return next (new CustomError('you are not allowed to access this information ',403))
    }
    next()
   }
}