const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../utils/auth');

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/forgot-password', userController.requestPasswordReset);
userRouter.post('/reset-password', userController.resetPassword);
userRouter.put("/change-password/:id",isAuthenticated, userController.changePassword);
userRouter.get("/:id",isAuthenticated, userController.getUserById);
userRouter.get('/users', userController.getUsers);

module.exports = userRouter;
