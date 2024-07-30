const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({

    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    items: [{
        productId: {
            type: String,
            ref: "Product"
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity can not be less then 1.'],
            deafult: 1
        },
    }],
});

module.exports = mongoose.model('CartItem', cartItemSchema);
