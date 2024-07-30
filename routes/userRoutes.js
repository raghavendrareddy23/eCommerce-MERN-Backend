const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/forgot-password', userController.requestPasswordReset);
userRouter.post('/reset-password', userController.resetPassword);
userRouter.get('/users', userController.getUsers);

module.exports = userRouter;
