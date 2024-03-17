const express =require("express");
const router = express.Router()
const { isLoggedIn } = require("../middleware/user");
const { sendStripeKey ,sendRazorpayKey,captureStripePayment,captureRazorpayPayment} = require("../controller/paymentController");


router.route("/stripekey").get(isLoggedIn,sendStripeKey);
router.route("/razorpaykey").get(isLoggedIn,sendRazorpayKey);


router.route("/capturestripe").get(isLoggedIn,captureStripePayment);
router.route("/capturerazorpay").get(isLoggedIn,captureRazorpayPayment);


module.exports = router;