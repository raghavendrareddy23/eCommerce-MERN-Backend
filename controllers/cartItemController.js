const Cart = require('../models/cartItem');
const Item = require('../models/products');
const mongoose = require('mongoose');


const addCartItem = async (req, res) => {
    let userId = req.params.userId;

    if (!userId && req.user) {
        userId = req.user._id;
    }

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid productId' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    try {
        let cart = await Cart.findOne({ userId });
        let item = await Item.findOne({ _id: productId });

        if (!item) {
            return res.status(404).json({ message: 'Item not found!' });
        }

        if (cart) {
            let existingItem = cart.items.find(item => item.productId === productId);

            if (existingItem) {
                // Product already exists in the cart, return message
                return res.status(400).json({ message: 'Product is already in the cart' });
            } else {
                // Product does not exist in the cart, push a new item
                cart.items.push({ productId, quantity });
                cart = await cart.save();
                return res.status(201).json(cart);
            }
        } else {
            // If cart does not exist, create a new one
            const newCart = await Cart.create({
                userId,
                items: [{ productId, quantity }],
                // Assuming price needs to be fetched from the item
                bill: item.price * quantity
            });
            return res.status(201).json(newCart);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}



const getCartItems = async (req, res) => {
    try {
        if (!req.user) {
            console.log("User is not authenticated");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.params.id;

        let cart = await Cart.findOne({ userId });

        if (cart && cart.items.length > 0) {
            return res.json(cart);
        } else {
            return res.json(null);
        }
    } catch (err) {
        console.error("Error fetching cart:", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const updateCartItem = async (req, res) => {
    const userId = req.params.id;
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid productId' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    try{
        let cart = await Cart.findOne({userId});
        let item = await Item.findOne({_id: productId});

        if(!item)
            return res.status(404).json({ message: 'Item not found!' }); 
        
        if(!cart)
          return res.status(400).json({ message: "Cart not found" });
        else{
            // if cart exists for the user
            let itemIndex = cart.items.findIndex(p => p.productId == productId);

            // Check if product exists or not
            if(itemIndex == -1)
              return res.status(404).json({ message: 'Item not found in cart!' });
            else {
                let productItem = cart.items[itemIndex];
                productItem.quantity = quantity;
                cart.items[itemIndex] = productItem;
            }
            cart = await cart.save();
            return res.status(201).json(cart);
        }     
    }
    catch (err) {
        console.log("Error in update cart", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

const deleteCartItemById = async (req, res) => {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    try {
        const cart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        return res.status(200).json({ message: "Item deleted successfully from the cart" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}



const deleteAllCartItems = async (req, res) => {
    const userId = req.params.userId;
    try {
        let cart = await Cart.findOneAndDelete({ userId: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        return res.status(200).json({ message: "Cart items deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}


module.exports = { addCartItem, getCartItems, updateCartItem, deleteAllCartItems, deleteCartItemById };
