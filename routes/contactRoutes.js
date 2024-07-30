const express = require('express');
const { sendContactForm } = require('../controllers/contactController');
const {isAuthenticated} = require('../utils/auth');

const contactRouter = express.Router();

contactRouter.post('/', isAuthenticated, sendContactForm);

module.exports = contactRouter;
