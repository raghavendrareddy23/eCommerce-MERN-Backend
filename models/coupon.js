const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
