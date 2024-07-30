const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Products = require("../models/products");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const uploadImage = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins have access",
      });
    }

    if (!req.body.categoryName) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    }

    const folder = "images";
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folder,
    });

    const category = new Category({
      categoryName: req.body.categoryName,
      cloudinary_id: result.public_id,
      categoryUrl: result.secure_url,
    });
    await category.save();

    res.status(200).json({
      success: true,
      folder: folder,
      message: "Uploaded!",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Toggle category status
    category.categoryStatus =
      category.categoryStatus === "active" ? "inactive" : "active";

    // Save the updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category status updated successfully",
      data: category,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error updating category status" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    const allCategories = categories;
    const activeCategories = categories.filter(
      (category) => category.categoryStatus === "active"
    );
    const inactiveCategories = categories.filter(
      (category) => category.categoryStatus !== "active"
    );
    res.status(200).json({
      success: true,
      allCategories,
      activeCategories,
      inactiveCategories,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryName, categoryStatus } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found in the database",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins have access",
      });
    }

    if (!req.body.categoryName) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    if (!req.body.categoryStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Category status is required" });
    }

    if (category.cloudinary_id) {
      await cloudinary.uploader.destroy(category.cloudinary_id);
    }

    let uploadResult;
    if (req.file) {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "images",
        public_id: categoryName,
      });
      category.cloudinary_id = uploadResult.public_id;
      fs.unlinkSync(req.file.path);
    }

    category.categoryName = categoryName;
    category.categoryStatus = categoryStatus;
    category.categoryUrl = uploadResult
      ? uploadResult.secure_url
      : category.categoryUrl;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      updatedCategory: category,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error updating category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found in the database",
      });
    }

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins have access",
      });
    }

    // Find all subcategories associated with the category
    const subCategories = await SubCategory.find({ category: categoryId });
    const subCategoryIds = subCategories.map((subCategory) => subCategory._id);

    const productsToDelete = await Products.find({
      subCategoryId: { $in: subCategoryIds },
    });

    await Products.deleteMany({ subCategoryId: { $in: subCategoryIds } });

    await SubCategory.deleteMany({ category: categoryId });

    await cloudinary.uploader.destroy(category.categoryUrl, {
      invalidate: true,
    });
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message:
        "Category, associated subcategories, and products deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = {
  uploadImage,
  updateCategoryStatus,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
};
