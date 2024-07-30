const express = require('express');
const addressRouter = express.Router();
const { isAuthenticated } = require('../utils/auth');
const {addAddress, getAddresses, updateAddress, deleteAddress} = require('../controllers/addressController');

addressRouter.post('/:id', isAuthenticated, addAddress);
addressRouter.get('/:id', isAuthenticated, getAddresses);
addressRouter.put('/:userId/:id', isAuthenticated, updateAddress);
addressRouter.delete('/:userId/:id', isAuthenticated, deleteAddress);

module.exports = addressRouter;
