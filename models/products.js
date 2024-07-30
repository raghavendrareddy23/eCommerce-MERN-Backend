const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  
  productName: {
    type: String,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  },
  cloudinary_id: {
    type: String,
  },
  imageGallery: {
    type: [String], // Array of image URLs
    validate: {
      validator: function(arr) {
        return arr.length <= 10; // Validate that the array contains up to 10 images
      },
      message: 'Image gallery cannot contain more than 10 images'
    }
  },
  price: {
    type: Number,
    required: true
  },
  sellPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: function() {
      // Calculate discount as a percentage
      const discountPercentage = ((this.price - this.sellPrice) / this.price) * 100;
      // Round the discount to two decimal places
      return Math.round(discountPercentage * 100) / 100;
    }
  },
  stock: {
    type: Number,
    required: true
  },
  productStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },
}, {
  timestamps: true // Add timestamps to the schema
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
