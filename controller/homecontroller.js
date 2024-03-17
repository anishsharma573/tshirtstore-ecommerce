const BigPromise = require("../middleware/bigPromise")


exports.home=BigPromise((req, res)=>{
    res.status(200).json({
        success:true,
        greetings:"Hello from Anish"
    })
})
exports.homeDummy=(req, res)=>{
    res.status(200).json({
        success:true,
        greetings:"This is an dummy route"
    })
}