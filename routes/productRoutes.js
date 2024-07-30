const express = require('express');
const productRouter = express.Router();
const upload = require("../utils/multer");
const productsController = require('../controllers/productsController');
const { uploadImage, getAllProducts, getProductById, updateProductStatus, updateProduct, deleteProduct } = productsController;
const { isAuthenticated, isAdmin } = require('../utils/auth');

productRouter.post('/uploadImage', upload.array('images', 10), isAuthenticated, isAdmin, uploadImage);
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.patch('/:id', isAuthenticated, isAdmin, updateProductStatus);
productRouter.put('/:id', upload.array('images', 10), isAuthenticated, isAdmin, updateProduct)
productRouter.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = productRouter;
