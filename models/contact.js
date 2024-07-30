const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid contact number (10 digits)'],
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
