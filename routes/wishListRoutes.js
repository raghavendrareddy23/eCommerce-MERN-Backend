// wishListRoutes.js
const express = require('express');
const wishListRouter = express.Router();
const wishListController = require('../controllers/wishListController');
const {isAuthenticated} = require('../utils/auth');

wishListRouter.post('/:id',isAuthenticated, wishListController.addToWishList);
wishListRouter.get('/:userId', isAuthenticated, wishListController.getWishList);
wishListRouter.delete('/:userId/:productId', isAuthenticated, wishListController.removeFromWishList);

module.exports = wishListRouter;
