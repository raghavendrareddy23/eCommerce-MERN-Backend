const cloudinary = require("cloudinary").v2;
const SubCategory = require("../models/subCategory");
const Products = require("../models/products");

const uploadImage = async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only admins have access",
        });
      }

      if (!req.body.subCategoryName || !req.body.productName || !req.body.productDescription || !req.body.price || !req.body.sellPrice || !req.body.stock) {
        return res.status(400).json({
          success: false,
          message: "SubCategory name, product name, description, price, sell price, and stock are required",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one image is required",
        });
      }
  
      // Upload images to Cloudinary
      const folder = "images/products";
      const uploadedImages = [];
      let result; // Declare result outside the loop
  
      for (const file of req.files) {
        result = await cloudinary.uploader.upload(file.path, {
          folder: folder,
        });
        uploadedImages.push(result.secure_url);
      }
  
      // Find the SubCategory by subCategoryName
      const subCategory = await SubCategory.findOne({
        subCategoryName: req.body.subCategoryName,
      });
      if (!subCategory) {
        return res
          .status(404)
          .json({ success: false, message: "SubCategory not found" });
      }
  
      // Create a new record in the database for the uploaded Product
      const product = new Products({
        subCategoryName: req.body.subCategoryName,
        subCategoryId: subCategory._id, // Assign the subCategoryId from the found SubCategory
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        cloudinary_id: result.public_id, // Use result here
        imageGallery: uploadedImages, // Store the image URLs
        price: req.body.price,
        sellPrice: req.body.sellPrice,
        stock: req.body.stock,
      });
      await product.save();
  
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
  
const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const pageSize = 6; 
  const skip = (page - 1) * pageSize;

  try {
    const totalProducts = await Products.countDocuments(); 

    const allProducts = await Products.find()
      .populate({
        path: "subCategoryId",
        populate: {
          path: "category",
          model: "Category",
        },
      })
      .skip(skip)
      .limit(pageSize);

    const activeProducts = allProducts.filter(
      (product) => product.productStatus === "active"
    );
    const inactiveProducts = allProducts.filter(
      (product) => product.productStatus === "inactive"
    );

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: page,
        allProducts,
        activeProducts,
        inactiveProducts,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};


  
  // Function to get a product by ID
  const getProductById = async (req, res) => {
    try {
      const productId = req.params.id;
  
      // Fetch the product from the database by ID
      const product = await Products.findById(productId);
  
      // Check if the product exists
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error fetching product",
      });
    }
  };

  const updateProductStatus = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        product.productStatus = product.productStatus === 'active' ? 'inactive' : 'active';
        
        await product.save();

        res.status(200).json({ success: true, message: "Product status updated successfully", data: product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error updating Product status" });
    }
};

const updateProduct = async (req, res) => {
  try {
      const productId = req.params.id;
      const { subCategoryName, productName, productDescription, price, sellPrice, stock, productStatus } = req.body;

      // Find the existing product by ID
      let product = await Products.findByIdAndUpdate(productId);
      if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
      }

      // Check if the user is an admin
      if (req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: "Forbidden: Only admins have access" });
      }

      // Obtain the SubCategory by subCategoryName
      const subCategory = await SubCategory.findOne({ subCategoryName });
      if (!subCategory) {
          return res.status(404).json({ success: false, message: "SubCategory not found" });
      }

      // Delete previous images from Cloudinary
      if (product.imageGallery && product.imageGallery.length > 0) {
          for (const imageUrl of product.imageGallery) {
              const publicId = imageUrl.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(publicId);
          }
      }

      // Upload new images to Cloudinary if provided
      let updatedImageGallery = [];
      if (req.files && req.files.length > 0) {
          const folder = "images/products";
          for (const file of req.files) {
              const result = await cloudinary.uploader.upload(file.path, { folder: folder });
              updatedImageGallery.push(result.secure_url);
          }
      }
      

      // Update product fields
      product.subCategoryName = subCategoryName || product.subCategoryName;
      product.subCategoryId = subCategory._id; // Assign the subCategoryId from the found SubCategory
      product.productName = productName || product.productName;
      product.productStatus = productStatus || product.productStatus;
      product.productDescription = productDescription || product.productDescription;
      product.imageGallery = updatedImageGallery.length > 0 ? updatedImageGallery : product.imageGallery;
      product.price = price || product.price;
      product.sellPrice = sellPrice || product.sellPrice;
      let discount = 0;
      if (price !== product.price || sellPrice !== product.sellPrice) {
          discount = Math.round(((product.price - product.sellPrice) / product.price) * 100);
          // console.log(discount);
      }
      product.stock = stock || product.stock;
      product.discount = discount;

      // Save updated product to the database
      await product.save();

      res.status(200).json({
          success: true,
          message: "Product updated successfully",
          updatedProduct: product
      });
      // console.log(product);
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error updating product" });
  }
};
  

  const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found in the database" });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: Only admins have access" });
        }

        // Loop through each image URL in the product's imageGallery array
        for (const imageUrl of product.imageGallery) {
            // Extract the public ID from the image URL
            const publicId = imageUrl.split("/").pop().split(".")[0];
            // Delete the image from Cloudinary
            await cloudinary.uploader.destroy(publicId, { invalidate: true });
        }

        // Delete the product from the database
        await Products.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error" });
    }
};

  
  module.exports = {
    uploadImage,
    getAllProducts,
    getProductById,
    updateProductStatus,
    updateProduct,
    deleteProduct
  };