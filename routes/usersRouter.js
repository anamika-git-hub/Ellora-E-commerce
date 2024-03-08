const express = require('express');
const user_route = express();
// const session= require('express-session');

// const config=require('../config/config')
// user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

// const auth=require('../middleware/userAuth')

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

user_route.set(express.json());
user_route.set(express.urlencoded({extended:true}))

const userController=require('../controller/userController')
user_route.get('/login',userController.loadLogin);

user_route.get('/signUp',userController.loadSignup);
user_route.post('/signUp',userController.insertUser);


user_route.get('/otp',userController.loadOtp);
user_route.post('/otp',userController.verifyOtp);
user_route.get('resend',userController.resendOtp);

user_route.post('/login',userController.verifyLogin);

user_route.get('/dashboard',userController.loadHome);
user_route.get('/logout',userController.loadLogout);

module.exports = user_route;
 