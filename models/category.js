const mongoose = require("mongoose");

// Define the schema for the Category model
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryUrl: {
      type: String,
    },
    cloudinary_id: {
      type: String, // Store the public ID from Cloudinary
    },
    categoryStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // Default status is active
    },
  },
  {
    timestamps: true,
  }
);

// Create the Category model using the schema
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
