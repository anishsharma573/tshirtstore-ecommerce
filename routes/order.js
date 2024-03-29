const express =require("express");
const router = express.Router()
const { isLoggedIn,customRole } = require("../middleware/user");
const { createOrder,getOneOrder,getLoggedInOrders,admingetAllOrders,adminUpdateOrder,adminDeleteOneOrder } = require("../controller/orderController");


router.route("/order/create").post(isLoggedIn,createOrder)
router.route("/order/:id").get(isLoggedIn,getOneOrder)
router.route("/myorder").get(isLoggedIn,getLoggedInOrders)
router.route("/myorder").get(isLoggedIn,admingetAllOrders)


//adminroutes
router.route("/admin/orders").get(isLoggedIn,customRole('admin') ,admingetAllOrders)
router.route("/admin/order/:id").put(isLoggedIn,customRole('admin') ,adminUpdateOrder).delete(isLoggedIn,customRole('admin') ,adminDeleteOneOrder)









module.exports = router;
