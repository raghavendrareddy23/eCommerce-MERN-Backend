// routes/notificationRoutes.js
const express = require('express');
const socketRouter = express.Router();
const socketController = require('../controllers/socketController');


socketRouter.get('/initial', socketController.getInitialNotifications);
socketRouter.put('/:id', socketController.updateNotificationStatus);

module.exports = socketRouter;
