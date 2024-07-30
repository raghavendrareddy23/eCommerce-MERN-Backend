const { Router } = require('express');
const orderController = require('../controllers/orderController');
const {isAuthenticated} = require('../utils/auth');
const orderRouter = Router();

orderRouter.get('/:id', isAuthenticated, orderController.get_orders);
orderRouter.get('/:userId/:productId', isAuthenticated, orderController.get_order_by_id);
orderRouter.post('/:id', isAuthenticated, orderController.checkout);

module.exports = orderRouter;
