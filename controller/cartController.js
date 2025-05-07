const User = require('../models/userModel')
const Cart = require('../models/cartModel');
const Product = require('../models/productsModel');
const Wishlist = require('../models/wishlistModel');
const Offer = require('../models/offerModel');
const Coupon = require('../models/couponModel')
    const loadCart = async (req, res) => {
        try {
            if (!req.session.user_id) {
                req.flash('cart', 'Please login to get our service');
                return res.redirect('/login');
            }
    
            const userId = req.session.user_id;
            const cartData = await Cart.findOne({ userId: userId }).populate('userId').populate({ path: 'products.productId', populate: { path: 'offer' } });
            const wishlistData = await Wishlist.findOne({ userId: userId }).populate('userId').populate('products.productId');
    
            let subTotal = 0;
    
            if (cartData && cartData.products && cartData.products.length > 0) {
                cartData.products.forEach(value => {
                    if (value.productId.offer && value.productId.offer.status && new Date(value.productId.offer.expiredAt) > new Date()) {
                        const offer = value.productId.offer.offerPrice;
                        const discountedPrice = value.productId.price - (value.productId.price * offer) / 100;
                        value.productPrice = discountedPrice;
                        value.totalPrice = discountedPrice * value.quantity;
                        subTotal += value.totalPrice;
                    } else {
                        value.productPrice = value.productId.price
                        value.totalPrice = value.productId.price * value.quantity;
                        subTotal += value.totalPrice;
                    }
                });
    
                await cartData.save();
            }
    
            res.render('cart', { cartData, subTotal, wishlistData, userId });
        } catch (error) {
            console.error('Error loading cart:', error.message);
            res.status(500).send('Internal Server Error');
        }
    };
    


    const addtoCart = async(req, res) => {
        try {
            if(!req.session.user_id) {
                return res.json({ login: true, message: "You need to log in to add items to your cart." });
            }
    
            const { productId, productQuantity } = req.body;
            const productData = await Product.findById({ _id: productId }).populate('offer');
            const cartData = await Cart.findOne({ userId: req.session.user_id });
    
            if(cartData) {
                const existProduct = cartData.products.find((pro) => pro.productId.toString() == productId);
                if(existProduct) {
                    return res.json({ success: false, message: "This item is already in the cart." });
                } else {
                    await Cart.findOneAndUpdate(
                        { userId: req.session.user_id },
                        { $push: { products: { productId: productId, quantity: productQuantity, productPrice: productData.price, totalPrice: productQuantity * productData.price } } }
                    );
                }
            } else {
                const newCart = new Cart({
                    userId: req.session.user_id,
                    products: [
                        {
                             productId : productId,
                             quantity : productQuantity, 
                             productPrice : productData.price,
                             totalPrice : productQuantity* productData.price,
                             }
                            ]

                });
    
                await newCart.save();
            }
    
            res.json({ success: true, message: "Item added to cart successfully." });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "An error occurred while adding to cart." });
        }
    };

const updateQuantity = async (req, res) => {
    try {
        const { productId, productQuantity } = req.body;
        req.session.productId = productId;
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({ path: 'products.productId', populate: { path: 'offer' } });

        const product = cartData.products.find((product) => product.productId.equals(productId));
        product.quantity = productQuantity;
        product.totalPrice = product.productPrice * productQuantity;

        const subTotal = cartData.products.reduce((total, product) => total + product.totalPrice, 0);

        await cartData.save();
        res.status(200).json({ status: 'success', message: 'Quantity updated successfully', totalPrice: product.totalPrice, subTotal });
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCartItem = async(req,res)=>{
    try {
        const {productId} = req.body;
         const cartData = await Cart.findOneAndUpdate({userId: req.session.user_id},{$pull:{products:{productId}}} )

    } catch (error) {
        console.log(error.message);
        
    }
}

const loadCheckOut = async (req, res) => {
    try {
        const { selectedShipping } = req.query;
        let shippingMethod = '';
        let shippingCost = 0;

        if (selectedShipping == 0) {
            shippingMethod = 'Free Shipping';
        } else if (selectedShipping == 10) {
            shippingMethod = 'Standard';
            shippingCost = 10;
        } else if (selectedShipping == 20) {
            shippingMethod = 'Express';
            shippingCost = 20;
        } else {
            shippingCost = 60;
            shippingMethod = 'Delivery Charge';
        }
      
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const addresses = user.addresses;

        const cartData = await Cart.findOne({ userId: userId }).populate({ path: 'products.productId' });
        
        if (cartData.products.length <= 0) {
            res.redirect('/cart');
        } else {
            const subTotal = cartData.products.reduce((total, product) => total + product.totalPrice, 0);

            const wishlistData = await Wishlist.findOne({ userId: req.session.user_id }).populate('userId').populate('products.productId');

            const couponData = await Coupon.find({
                minimumLimit: { $lte: subTotal },
                status: 'active',
                is_listed: true,
                'usedUsers.userId': { $ne: req.session.user_id }
            });

            const discountAmount = 0; 
            const totalAfterDiscount = subTotal+shippingCost; 

            const errorMessages = req.flash('error');

            res.render('checkout', {
                cartData,
                subTotal,
                addresses,
                totalAfterDiscount,
                wishlistData,
                discountAmount,
                errorMessages,
                shippingMethod,
                couponData,
                userId
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadCart,
    addtoCart,
    updateQuantity,
    deleteCartItem,
    loadCheckOut
}