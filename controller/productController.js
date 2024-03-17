const Product = require("../models/product")
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");


exports.addProducts = BigPromise(async (req,res,next)=>{

    //images

    let imageArray=[]

    if(!req.files){
           return next(new CustomError("Images are required",401))
    }

    if(req.files){
     for (let index = 0; index < req.files.photos.length; index++) {
     let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
        folder:"products"
     })
    
     imageArray.push({
        id:result.public_id,
        secure_url:result.secure_url
     })
     }

    }

    req.body.photos =imageArray
    req.body.user = req.user.id


  const product = await  Product.create(req.body)

  res.status(200).json({
    success:true,
    product
  })

})

exports.getAllProducts = BigPromise(async (req, res, next) => {
  console.log("Getting all products...");
  try {
      const resultperPage = 6;
      const totalcountProduct = await Product.countDocuments();
      
      const productsObj = new WhereClause(Product.find(), req.query).search().filter();
      let products = await productsObj.base;
      const filteredProductsNumber = products.length;
  
      productsObj.pager(resultperPage);
      products = await productsObj.base.clone();
      
      console.log("Products retrieved successfully.");
  
      res.status(200).json({
          success: true,
          products,
          filteredProductsNumber,
          totalcountProduct
      });
  } catch (error) {
      console.error("Error while retrieving products:", error);
      return next(new CustomError("Error while retrieving products: " + error.message, 500));
  }
});


exports.addReview = BigPromise(async (req, res, next) => {
 const {rating,comment,productId} = req.body

 const review ={
  user: req.user._id,
  name:req.user.name,
  rating:Number(rating),
  comment
 }

const product = await Product.findById(productId)

const AlreadyReview = product.reviews.find(
  (rev)=>rev.user.toString()===req.user._id
)


if(AlreadyReview){
 product.reviews.forEach((review)=>{
  if(review.user.toString()===req.user._id){
   review.comment = comment
   review.rating=rating
  }
 })
}else{
  product.reviews.push(review)
  product.numberOfReviews=product.reviews.length
}


// adjust ratings
product.ratings = products.reviews.reduce((acc,item)=>item.rating + acc, 0)/product.reviews.length



//save
await product.save({validateBeforeSave:false  })

});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const {productId} = req.query
 
 
 const product = await Product.findById(productId)
 

 const reviews = product.reviews.filter(
  (rev) => rev.user.toString() === req.user._id
 )
 
 
 const numberOfReviews = reviews.length

 
 // adjust ratings
 product.ratings = products.reviews.reduce((acc,item)=>item.rating + acc, 0)/product.reviews.length
 
 
 
 //update the product 
 await Product.findByIdAndUpdate(productId,{
  reviews,
  ratings,
  numberOfReviews
 },{
  new:true,
  runValidators:true,
  useFindAndModify:false
 })

res.status(200).json({
  success:true,

})
})


exports.getOnlyReviewsForOneProduct =BigPromise(async(req,res,next)=>{
  const product = await Product.findById(req.query.id)
  res.status(200).json({
    success:true,
    reviews:product.reviews,
  })
})


exports.getOneProduct = BigPromise(async (req, res, next) => {
 const product = await Product.findById(req.params.id)

 if(!product){
  return next(new CustomError("No product found with this id",401))
 }
 res.status(200).json({
  success:true,
  product
 })
})

// admin all controllers

exports.adminGetAllProduct = BigPromise(async (req,res,next)=>{
 const products = await  Product.find()



 res.status(200).json({
  success:true,
  products
 })
})


exports.adminUpdateOneProduct = BigPromise(async (req,res,next)=>{
  let product = await Product.findById(req.params.id)

  if(!product){
    return next(new CustomError("No product found with this id",401))
   }

   let imagesArray=[];

if(req.files){

  // destroy the existing images 
  for(let index=0; index<product.photos.length;index++){
  const res = await cloudinary.v2.uploader.destroy(product.photos[index].id)

  }


  // Upload the new images


    for (let index = 0; index < req.files.photos.length; index++) {
    let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
       folder:"products" // folder name --> env file 
    })
   
    imagesArray.push({
       id:result.public_id,
       secure_url:result.secure_url
    })
    }

   
}
req.body.photos =imagesArray

product = await Product.findByIdAndUpdate(req.params.id,req.body,{
  new:true,
  runValidators:true,
  useFindAndModify:false
})

   res.status(200).json({
    success:true,
    product
   })
})





exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  try {
      const product = await Product.findById(req.params.id);

      if (!product) {
          return next(new CustomError("No product found with this id", 401));
      }

      // Destroy the existing images
      for (let index = 0; index < product.photos.length; index++) {
          await cloudinary.v2.uploader.destroy(product.photos[index].id);
      }

      // Remove the product document
      await Product.deleteOne({ _id: req.params.id });

      res.status(200).json({
          success: true,
          message: "Product was deleted"
      });
  } catch (error) {
      return next(new CustomError("Error while deleting product: " + error.message, 500));
  }
});



