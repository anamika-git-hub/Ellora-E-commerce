const express = require('express');
const user_route = express();
const session = require('express-session');

const config = require('../config/config')
const tryCatch = require('../middleware/TryCatch')
user_route.use(session({secret:"abc",resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/userAuth')

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))

const userController=require('../controller/userController')
const productController = require('../controller/productController');
const cartController = require('../controller/cartController');

user_route.get('/',isLogin,userController.loadHome);
user_route.get('/login',isLogout,userController.loadLogin);
user_route.get('/signUp',isLogout,userController.loadSignup);
user_route.post('/signUp',userController.insertUser);

user_route.get('/otp',userController.loadOtp);
user_route.post('/otp',userController.verifyOtp);
user_route.post('/resend',userController.resendOtp);

user_route.post('/login',isLogout,userController.verifyLogin);
user_route.get('/logout',userController.loadLogout);

user_route.get('/contact',userController.loadContact);
user_route.get('/about',userController.loadAbout);

user_route.get('/profile',userController.loadProfile);
user_route.post('/profile',userController.editProfile);
user_route.post('/profile',userController.resetPasswithOld);

user_route.get('/products',productController.productPage);
user_route.get('/productDetail',productController.productDetails)


user_route.get('/cart',cartController.loadCart);
user_route.post('/cart',cartController.addtoCart);


module.exports = user_route;
 