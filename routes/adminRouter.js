var express = require('express');
var admin_route = express();
const session= require('express-session');

const config=require('../config/config');
admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const auth=require('../middleware/adminAuth');

admin_route.set(express.json());
admin_route.set(express.urlencoded()); 

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin')

const adminController=require('../controller/adminController')
const productController=require('../controller/productController')
const orderController=require('../controller/orderController')
/* GET home page. */
admin_route.get('/adminLogin',auth.isLogout,adminController.loadLogin);

admin_route.post('/adminLogin',adminController.verifyLogin);
admin_route.get('/adminHome',auth.isLogin,adminController.loadHome);

admin_route.get('/adminCategories',productController.loadCategories);
admin_route.get('/orderList',orderController.loadOrderList);
admin_route.get('/productList',productController.loadProductList)




module.exports = admin_route;
