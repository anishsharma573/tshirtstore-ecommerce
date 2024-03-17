const express =require("express")
const { signUp,login,logout,forgotPassword,passwordReset ,getLoggedInUserDetails,changePassword,updateUserDetails,adminALlUser,manageAllUser,adminGetOneUser,adminUpdateOneUserDetails,adminDeleteOneUserDetails} = require("../controller/userController")
const { isLoggedIn,customRole } = require("../middleware/user")


const router = express.Router()


router.route("/signUp").post(signUp)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/forgotPassword").post (forgotPassword)
router.route("/password/reset/:token").post(passwordReset)
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails)
router.route("/password/update").post(isLoggedIn,changePassword)
router.route("/userdashboard/update").post(isLoggedIn,updateUserDetails)

//adminOnlyRoutes
router.route("/admin/users").get(isLoggedIn,customRole('admin'), adminALlUser)
router.route("/admin/user/:id").get(isLoggedIn,customRole('admin'), adminGetOneUser)
.put(isLoggedIn,customRole('admin'),adminUpdateOneUserDetails)
.delete(isLoggedIn,customRole('admin'),adminDeleteOneUserDetails)
//manager only Routes
router.route("/manager/users").get(isLoggedIn,customRole('manager'), manageAllUser)

module.exports = router;
