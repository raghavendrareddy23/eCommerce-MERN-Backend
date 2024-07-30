const express = require("express");
const router = express.Router();
const userRouter = require("./userRoutes")
const categoryRouter = require("./categoryRoutes");
const productRouter = require("./productRoutes");
const cartRouter = require("./cartRoutes");
const wishlistRouter = require("./wishListRoutes");
const addressRouter = require("./addressRoutes");
const orderRouter = require("./orderRoutes");
const subCategoryRouter = require('./subCategoryRoutes');
const couponRouter = require("./couponRoutes")
const socketRouter = require('./socketRoutes')
const contactRouter = require('./contactRoutes')

router.use("/user", userRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/subcategory", subCategoryRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", wishlistRouter);
router.use("/address", addressRouter);
router.use("/orders", orderRouter);
router.use("/coupon", couponRouter);
router.use("/notifications", socketRouter);
router.use("/contact", contactRouter);

module.exports = router;
