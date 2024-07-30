const express = require('express');
const categoryRouter = express.Router();
const categoryController = require('../controllers/categoryController');
const {isAuthenticated, isAdmin} = require('../utils/auth');
const { uploadImage, updateCategoryStatus,updateCategory, deleteCategory, getAllCategories, getCategoryById } = categoryController;

const upload = require('../utils/multer'); 

// Define routes
categoryRouter.post('/uploadImage', upload.single('image'),isAuthenticated, isAdmin, uploadImage);
categoryRouter.get('/', getAllCategories);
categoryRouter.get('/:id', getCategoryById);
categoryRouter.patch('/:id', isAuthenticated,isAdmin, updateCategoryStatus);
categoryRouter.put('/:id',upload.single('image'),isAuthenticated, isAdmin, updateCategory);
categoryRouter.delete('/:id',isAuthenticated, isAdmin, deleteCategory);

module.exports = categoryRouter;
