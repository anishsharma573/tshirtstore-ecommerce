const BigPromise = require("../middleware/bigPromise");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.sendStripeKey = BigPromise(async (req,res,next)=>{
    res.status(200).json({
        stripekey:process.env.STRIPE_API_KEY
    })
})

exports.captureStripePayment = BigPromise(async (req,res,next)=>{
 
    const paymentIntent = await stripe.paymentIntents.create({
        ammount :req.body.amount,
        currenct:'inr',



        //optional 
        metadata:{integration_check: 'accept_a_payment'}
    })

    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret_secret

        //you can optonally send id as well
    })
})


exports.sendRazorpayKey = BigPromise(async (req,res,next)=>{
    res.status(200).json({
        stripekey:process.env.RAZORPAY_API_KEY
    })
})



exports.captureRazorpayPayment = BigPromise(async (req,res,next)=>{
 
    var instance = new Razorpay({ key_id: 'process.env.RAZORPAY_API_KEY',
     key_secret: 'process.env.RAZORPAY_SECRET_KEY' })

    const myOrder= await instance.orders.create({
      amount: req.body.amount,
      currency: "INR",
    //   receipt: "",
      notes: {
        key1: "value3",
        key2: "value2"
      }
    })

 res.status(200).json({
    success:true,
    amount:req.body.amoumt,
    order:myOrder
 })
})