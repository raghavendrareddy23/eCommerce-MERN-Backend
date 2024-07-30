const Coupon = require("../models/coupon");

function generateCouponCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

const createCoupon = async (req, res) => {
  try {
    let code;
    let isCodeUnique = false;
    while (!isCodeUnique) {
      code = generateCouponCode();
      const existingCoupon = await Coupon.findOne({ code });
      if (!existingCoupon) {
        isCodeUnique = true;
      }
    }

    if (!req.body.percentage) {
      return res
        .status(400)
        .json({ success: false, message: "Percentage is required" });
    }

    const coupon = new Coupon({
      code,
      percentage: req.body.percentage,
      status: req.body.status || "active",
    });

    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: "Coupon not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
  
      const { percentage } = req.body;
      if (percentage !== undefined && percentage !== coupon.percentage) {
        let code;
        let isCodeUnique = false;
        while (!isCodeUnique) {
          code = generateCouponCode();
          const existingCoupon = await Coupon.findOne({ code });
          if (!existingCoupon || existingCoupon._id.toString() === id) {
            isCodeUnique = true;
          }
        }
        req.body.code = code;
      }
      const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
        new: true,
      });
  
      res.json(updatedCoupon);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  

  const updateCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
    
        if (!coupon) {
          return res.status(404).json({ error: "Coupon not found" });
        }
    
        coupon.status =
          coupon.status === "active" ? "inactive" : "active";
        await coupon.save();
    
        res
          .status(200)
          .json({ message: "Coupon status updated successfully", data: coupon });
      } catch (error) {
        console.error("Error updating Coupon status:", error);
        res.status(500).json({ error: "Error updating Coupon status" });
      }
  };


  const deleteCouponById = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCoupon = await Coupon.findByIdAndDelete(id);
  
      if (!deletedCoupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
        data: deletedCoupon,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error deleting coupon" });
    }
  };
  
  const validateCouponByCode = async (req, res) => {
    try {
      const { code } = req.body;
  
      if (!code) {
        return res.status(400).json({ success: false, message: "Coupon code is required" });
      }
  
      const coupon = await Coupon.findOne({ code });
  
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
  
      if (coupon.status !== "active") {
        return res.status(400).json({ success: false, message: "Coupon is not active" });
      }
  
      req.couponId = coupon._id;
  
      res.status(200).json({ success: true, message: "Coupon is valid", couponId: coupon._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error validating coupon" });
    }
  };
  
  
  
  
  
  

module.exports = { createCoupon, getAllCoupons, getCouponById, updateCoupon, updateCouponStatus, deleteCouponById, validateCouponByCode };
