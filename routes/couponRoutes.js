const express = require('express');
const couponRouter = express.Router();
const { createCoupon, getAllCoupons, getCouponById, updateCoupon, updateCouponStatus, deleteCouponById, validateCouponByCode } = require('../controllers/couponController');

couponRouter.post('/create-coupon', createCoupon);
couponRouter.post('/validate', validateCouponByCode);
couponRouter.get('/', getAllCoupons);
couponRouter.get('/:id', getCouponById);
couponRouter.put('/:id', updateCoupon);
couponRouter.put('/update-status/:id', updateCouponStatus);
couponRouter.delete('/:id', deleteCouponById);

module.exports = couponRouter;
