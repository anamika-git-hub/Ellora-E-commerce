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
userRouter.get('/login',isLogout,userController.loadLogin);
userRouter.get('/signUp',isLogout,userController.loadSignup);
userRouter.post('/signUp',isLogout,userController.insertUser);

userRouter.get('/otp',isLogout,userController.loadOtp);
userRouter.post('/otp',isLogout,userController.verifyOtp);
userRouter.post('/resend',isLogout,userController.resendOtp);

userRouter.post('/login',isLogout,userController.verifyLogin);
userRouter.get('/google',isLogout,userController.googleAuthentication);
userRouter.get('/logout',isLogin,userController.loadLogout);
userRouter.get('/contact',userController.loadContact);
userRouter.get('/about',userController.loadAbout);

userRouter.get('/profile', isLogin, userController.loadProfile);
userRouter.get('/walletHistory',isLogin,userController.showWalletHistory);
userRouter.get('/orders', isLogin, userController.showOrderList);
userRouter.get('/orderHistory',isLogin,orderController.loadOrderHistory);
userRouter.post('/profile',isLogin,userController.editProfile);
userRouter.post('/profile',isLogin,userController.resetPasswithOld);
userRouter.post('/addAddress',isLogin,userController.addAddress);
userRouter.put('/editAddress',isLogin,userController.editAddress);
userRouter.post('/deleteAddress',isLogin,userController.deleteAddress);

userRouter.get('/products',productController.productPage);
userRouter.get('/filterProduct',isLogin,productController.filterProduct);
userRouter.get('/productDetail',productController.productDetails);


userRouter.get('/wishlist',isLogin,wishlistController.loadWishlist);
userRouter.post('/addWishlist',isLogin,wishlistController.addtoWishlist);
userRouter.post('/deleteWishlistItem',isLogin,wishlistController.deleteWishlistItem);


userRouter.get('/cart',isLogin,cartController.loadCart);
userRouter.post('/addcart',isLogin,cartController.addtoCart);
userRouter.post('/cartUpdate',isLogin,cartController.updateQuantity);
userRouter.post('/deleteCartItem',isLogin,cartController.deleteCartItem);
userRouter.get('/availableCoupons',isLogin,couponController.availableCoupons);
userRouter.post('/applyCoupon',isLogin,couponController.applyCoupon);

userRouter.get('/CheckOut',isLogin,cartController.loadCheckOut);
userRouter.post('/placeOrder',isLogin,orderController.placeOrder);
userRouter.patch('/retryRazorpay',isLogin,orderController.retryRazorpay);
userRouter.post('/verifyPayment',isLogin,orderController.verifyPayment);
userRouter.get('/successPage',isLogin,orderController.loadSuccessPage);
userRouter.get('/orderInvoice',isLogin,orderController.loadOrderInvoice);
userRouter.get('/failedPage',isLogin,orderController.loadFailedPage);
userRouter.get('/cancelOrder',isLogin,orderController.cancelOrder);
userRouter.post('/returnProduct',isLogin,orderController.returnProduct);

userRouter.get('/404',isLogin,userController.ErrorPage);

userRouter.get('*',function(req,res){
    res.redirect('/404');
})

module.exports = userRouter;
 