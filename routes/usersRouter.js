const express = require('express');
const userRouter = express();
const session = require('express-session');

const config = require('../config/config')
const tryCatch = require('../middleware/TryCatch')
userRouter.use(session({secret:config,resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/userAuth')

userRouter.set('view engine','ejs');
userRouter.set('views','./views/users')

userRouter.use(express.json());
userRouter.use(express.urlencoded({extended:true}))

const userController=require('../controller/userController')
const productController = require('../controller/productController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController');
const wishlistController = require('../controller/wishlistController');
const couponController = require('../controller/couponController')

userRouter.get('/',userController.loadHome);
userRouter.get('/login',userController.loadLogin);
userRouter.get('/signUp',userController.loadSignup);
userRouter.post('/signUp',userController.insertUser);

userRouter.get('/otp',userController.loadOtp);
userRouter.post('/otp',userController.verifyOtp);
userRouter.post('/resend',userController.resendOtp);

userRouter.post('/login',userController.verifyLogin);
userRouter.get('/google',userController.googleAuthentication);
userRouter.get('/logout',isLogin,userController.loadLogout);

userRouter.get('/contact',userController.loadContact);
userRouter.get('/about',userController.loadAbout);

userRouter.get('/profile',isLogin,userController.loadProfile);
userRouter.put('/profile',isLogin,userController.editProfile);
userRouter.post('/profile',isLogin,userController.resetPasswithOld);
userRouter.post('/addAddress',isLogin,userController.addAddress);
userRouter.put('/editAddress',isLogin,userController.editAddress);
userRouter.post('/deleteAddress',isLogin,userController.deleteAddress);

userRouter.get('/products',productController.productPage);
userRouter.get('/filterProduct',isLogin,productController.filterProduct);
userRouter.get('/productDetail',isLogin,productController.productDetails);

// userRouter.post('/sort',productController.sortProduct);

userRouter.get('/wishlist',isLogin,wishlistController.loadWishlist);
userRouter.post('/wishlist',isLogin,wishlistController.addtoWishlist);
userRouter.post('/deleteWishlistItem',isLogin,wishlistController.deleteWishlistItem);


userRouter.get('/cart',isLogin,cartController.loadCart);
userRouter.post('/cart',isLogin,cartController.addtoCart);
userRouter.post('/cartUpdate',isLogin,cartController.updatequantity);
userRouter.post('/deleteCartItem',isLogin,cartController.deleteCartItem);
userRouter.post('/applyCoupon',isLogin,couponController.applyCoupon);

userRouter.get('/CheckOut',isLogin,cartController.loadCheckOut);
userRouter.post('/placeOrder',isLogin,orderController.placeOrder);
userRouter.post('/verifyPayment',isLogin,orderController.verifyPayment);
userRouter.get('/successPage',isLogin,orderController.loadSuccessPage);
userRouter.get('/cancelOrder',isLogin,orderController.cancelOrder);
userRouter.post('/returnProduct',isLogin,orderController.returnProduct);


module.exports = userRouter;
 