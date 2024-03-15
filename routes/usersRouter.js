const express = require('express');
const user_route = express();
const session = require('express-session');

const config = require('../config/config')
user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/userAuth')

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))

const userController=require('../controller/userController')
const productController = require('../controller/productController');

user_route.get('/',userController.loadHome);
user_route.get('/login',isLogout,userController.loadLogin);

user_route.get('/signUp',userController.loadSignup);
user_route.post('/signUp',userController.insertUser);


user_route.get('/otp',userController.loadOtp);
user_route.post('/otp',userController.verifyOtp);
user_route.post('/resend',userController.resendOtp);

user_route.post('/login',isLogout,userController.verifyLogin);

user_route.get('/dashboard',userController.loadDashboard);
user_route.get('/logout',isLogin,userController.loadLogout);

user_route.get('/products',productController.productPage);
user_route.get('/productDetail',productController.productDetails);



module.exports = user_route;
 