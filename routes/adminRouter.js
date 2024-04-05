var express = require('express');
var admin_route = express();
const session= require('express-session');


const config=require('../config/config');
const tryCatch = require('../middleware/TryCatch');
admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/adminAuth')

const imageUpload = require('../middleware/imageUploader');

admin_route.use(express.json());
admin_route.use(express.urlencoded({extended:true})); 



admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const adminController=require('../controller/adminController')
const productController=require('../controller/productController')
const categoryController=require('../controller/categoryController');
const orderController = require('../controller/orderController');

admin_route.get('/',isLogout,adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',isLogin,adminController.loadHome);

admin_route.get('/logout',isLogin,adminController.loadSignout);

admin_route.get('/Categories',isLogin,categoryController.loadCategories);
admin_route.get('/addCategories',isLogin,categoryController.loadAddCategories);
admin_route.post('/addCategories',categoryController.insertCategory);
admin_route.get('/listCategory',isLogin,categoryController.listCategory);
admin_route.get('/editCategories',isLogin,categoryController.editCategoryLoad);
admin_route.post('/editCategories',categoryController.updateCategories);

admin_route.get('/userList',isLogin,adminController.loadUserList);
admin_route.get('/blockUser',isLogin,adminController.blockUser);
admin_route.get('/addUsers',isLogin,adminController.loadAddUsers);
admin_route.post('/addUsers',adminController.addUser);
admin_route.get('/editUsers',isLogin,adminController.editUserLoad);
admin_route.post('/editUsers',adminController.updateUser);

admin_route.get('/productList',isLogin,productController.loadProductList);
admin_route.get('/addProducts',isLogin,productController.loadAddProducts);
admin_route.post('/addProducts',imageUpload,productController.addProducts);
admin_route.get('/listProduct',isLogin,productController.listProduct);
admin_route.get('/editproducts',isLogin,productController.editProductLoad);
admin_route.post('/editproducts',productController.updateProducts);

admin_route.get('/orderList',isLogin,orderController.loadOrderList);





admin_route.get('*',function(req,res){
    res.redirect('/admin');
})

module.exports = admin_route;
