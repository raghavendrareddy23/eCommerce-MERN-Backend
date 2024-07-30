const express = require('express');
const subCategoryRouter = express.Router();
const upload = require("../utils/multer");
const subCategoryController = require('../controllers/subCategoryController');
const { uploadImage, getAllSubCategories, getSubCategoryById, updateSubCategoryStatus, updateSubCategory, deleteSubCategory } = subCategoryController;
const { isAuthenticated, isAdmin } = require('../utils/auth');

subCategoryRouter.post('/uploadImage', upload.single('image'), isAuthenticated, isAdmin, uploadImage);
subCategoryRouter.get('/', getAllSubCategories);
subCategoryRouter.get('/:id', getSubCategoryById);
subCategoryRouter.patch('/:id', isAuthenticated, isAdmin, updateSubCategoryStatus);
subCategoryRouter.put('/:id', upload.single('image'), isAuthenticated, isAdmin, updateSubCategory);
subCategoryRouter.delete('/:id', isAuthenticated, isAdmin, deleteSubCategory);

module.exports = subCategoryRouter;
