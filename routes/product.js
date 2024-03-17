const express =require("express");
const { addProducts,getAllProducts ,adminGetAllProduct,getOneProduct,adminUpdateOneProduct,adminDeleteOneProduct,addReview,deleteReview,getOnlyReviewsForOneProduct} = require("../controller/productController");
const router = express.Router()
const { isLoggedIn,customRole } = require("../middleware/user")

// user Routes

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggedIn,addReview);
router.route("/review").delete(isLoggedIn,deleteReview);
router.route("/reviews").get(isLoggedIn,getOnlyReviewsForOneProduct);



//admin routes 
router.route("/admin/product/add").post(isLoggedIn,customRole('admin') , addProducts)
router.route("/admin/products").get(isLoggedIn,customRole('admin') , adminGetAllProduct)
router.route("/admin/product/:id").put(isLoggedIn,customRole('admin') , adminUpdateOneProduct).delete(isLoggedIn,customRole('admin') ,adminDeleteOneProduct)



module.exports = router;
