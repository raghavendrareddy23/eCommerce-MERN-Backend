const express = require('express');
const cartRouter = express.Router();
const { isAuthenticated } = require('../utils/auth');
const {
    addCartItem,
    getCartItems,
    updateCartItem,
    deleteCartItemById,
    deleteAllCartItems,
} = require('../controllers/cartItemController');

cartRouter.get('/:id', isAuthenticated, getCartItems);
cartRouter.post('/:id', isAuthenticated, addCartItem);
cartRouter.put('/:id', isAuthenticated, updateCartItem);
cartRouter.delete('/:userId', isAuthenticated, deleteAllCartItems);
cartRouter.delete('/:userId/:itemId',isAuthenticated, deleteCartItemById);

module.exports = cartRouter;
