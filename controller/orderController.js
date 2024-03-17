const Order = require("../models/order")
const Product = require("../models/product")
const CustomError = require("../utils/customError");
const BigPromise = require("../middleware/bigPromise");


exports.createOrder = BigPromise(async (req,res,next)=>{

    const {shippingInfo,
        orderItems,  
        paymentInfo ,
        taxAmount,
        totalAmount}= req.body


      const order = await   Order.create({
            shippingInfo,
        orderItems,  
        paymentInfo ,
        taxAmount,
        totalAmount,
        user:req.user._id
        })


        res.status(200).json({
            success:true,
            order
        })
})

exports.getOneOrder = BigPromise(async (req,res,next)=>{
    
 const order = await  Order.findById(req.params.id).populate('user', 'name email')
 
 if(!order){
    return next(new CustomError('Please Check the order id',401))
 }
    res.status(200).json({
        success:true,
        order
    })

})





exports.getLoggedInOrders = BigPromise(async (req,res,next)=>{
    
    const order = await  Order.find({user:req.user._id})
    
    if(!order){
       return next(new CustomError('Please Check the order id',401))
    }


       res.status(200).json({
           success:true,
           order
       })
   
})



exports.admingetAllOrders = BigPromise(async (req,res,next)=>{
    
    const orders= await  Order.find()
    
    

    
       res.status(200).json({
           success:true,
           order
       })
   
})
exports.adminUpdateOrder = BigPromise(async (req,res,next)=>{
    
    const order = await  Order.findById(req.params.id)
    if(order.orderStatus ==='Delivered'){
        return next (new CustomError("order is already marked froo delivered",401))
    }
    
    order.orderStatus =req.body.orderStatus
    order.orderItems.forEach(async prod=>{
      await   updateProductStock(prod.product,prod.quantity)
    })
    
  await order.save()
    
       res.status(200).json({
           success:true,
           order
       })
   
})


exports.adminDeleteOneOrder = BigPromise(async (req,res,next)=>{
    
    const order = await  Order.findById(req.params.id)
 
  await order.remove()
    
       res.status(200).json({
           success:true,
           
       })
   
})


async function updateProductStock(productId, quantity){
   const product =  Product.findByid(productId)
   product.stock = product.stock - quantity

  await  product.save({validateBeforeSave:false})
}