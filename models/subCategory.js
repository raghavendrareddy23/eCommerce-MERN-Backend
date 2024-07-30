const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  subCategoryName: {
    type: String,
    required: true,
  },
  cloudinary_id: {
    type: String,
  },
  subCategoryUrl: {
    type: String,
  },
  subCategoryStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    required: true,
  },
},
{
    timestamps: true,
}

);

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
