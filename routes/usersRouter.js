const express = require('express');
const user_route = express();
const session = require('express-session');

const config = require('../config/config')
const tryCatch = require('../middleware/TryCatch')
user_route.use(session({secret:config,resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/userAuth')

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))

const userController=require('../controller/userController')
const productController = require('../controller/productController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController');

user_route.get('/',userController.loadHome);
user_route.get('/login',userController.loadLogin);
user_route.get('/signUp',userController.loadSignup);
user_route.post('/signUp',userController.insertUser);

user_route.get('/otp',userController.loadOtp);
user_route.post('/otp',userController.verifyOtp);
user_route.post('/resend',userController.resendOtp);

user_route.post('/login',userController.verifyLogin);
user_route.get('/logout',userController.loadLogout);

user_route.get('/contact',isLogin,userController.loadContact);
user_route.get('/about',userController.loadAbout);

user_route.get('/profile',userController.loadProfile);
user_route.post('/profile',userController.editProfile);
user_route.post('/profile',userController.resetPasswithOld);
user_route.post('/addAddress',userController.addAddress);
user_route.post('/editAddress',userController.editAddress);
user_route.post('/deleteAddress',userController.deleteAddress);

user_route.get('/products',productController.productPage);
user_route.get('/productDetail',productController.productDetails);

user_route.post('/sort',productController.sortProduct);


user_route.get('/cart',cartController.loadCart);
user_route.post('/cart',cartController.addtoCart);
user_route.post('/cartUpdate',cartController.updatequantity);
user_route.post('/deleteCartItem',cartController.deleteCartItem);

user_route.get('/CheckOut',cartController.loadCheckOut);
user_route.post('/placeOrder',orderController.placeOrder);
user_route.get('/cancelOrder',orderController.cancelOrder);


module.exports = user_route;
 