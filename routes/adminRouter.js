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


admin_route.get('/',adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',adminController.loadHome);

admin_route.get('/adminCategories',productController.loadCategories);
admin_route.get('/userList',adminController.loadUserList);
admin_route.get('/productList',productController.loadProductList);

admin_route.get('/deleteCategories',productController.deleteCategories);
admin_route.get('/blockUser',adminController.blockUser);

admin_route.get('*',function(req,res){
    res.redirect('/admin');
})

module.exports = admin_route;
