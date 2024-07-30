const WishList = require('../models/wishList');
const Item = require('../models/products');

const addToWishList = async (req, res) => {
    let userId = req.params.userId;

    if (!userId && req.user) {
        userId = req.user._id;
    }

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { productId } = req.body;

    if (!req.body.productId) {
        return res.status(400).json({ success: false, message: 'Product Id is required' });
    }

    try {
        let wishList = await WishList.findOne({ userId });
        let item = await Item.findOne({ _id: productId });

        if (!item) {
            return res.status(404).send('Item not found!');
        }

        if (wishList) {
            let existingItem = wishList.items.find(item => item.productId.equals(productId));

            if (existingItem) {
                return res.status(400).send('Product is already in the wishlist');
            } else {
                wishList.items.push({ productId });
                wishList = await wishList.save();
                return res.status(201).json(wishList);
            }
        } else {
            const newWishList = await WishList.create({
                userId,
                items: [{ productId}],
            });
            return res.status(201).json(newWishList);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
}

const getWishList = async (req, res) => {
    const userId = req.params.userId;
    try {
        const wishList = await WishList.findOne({ userId }).populate('items.productId');
        if (!wishList) {
            return res.status(404).json({ success: false, message: 'Wish list not found' });
        }
        return res.json(wishList);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

const removeFromWishList = async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;
    try {
        const wishList = await WishList.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } },
            { new: true }
        );
        if (!wishList) {
            return res.status(404).json({ success: false, message: 'Wish list not found' });
        }
        return res.status(200).json(wishList);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

module.exports = {
    addToWishList,
    getWishList,
    removeFromWishList,
}
