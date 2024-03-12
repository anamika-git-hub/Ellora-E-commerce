var express = require('express');
var admin_route = express();
const session= require('express-session');


const config=require('../config/config');
admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const auth=require('../middleware/adminAuth');

admin_route.use(express.json());
admin_route.use(express.urlencoded()); 

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin')

const adminController=require('../controller/adminController')
const productController=require('../controller/productController')
const categoryController=require('../controller/categoryController')

admin_route.get('/',adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',adminController.loadHome);

admin_route.get('/Categories',categoryController.loadCategories);
admin_route.get('/addCategories',categoryController.loadAddCategories);
admin_route.post('/addCategories',categoryController.insertCategory);
admin_route.get('/listCategory',categoryController.listCategory);
admin_route.get('/editCategories',categoryController.editCategoryLoad);
admin_route.post('/editCategories',categoryController.updateCategories);

admin_route.get('/userList',adminController.loadUserList);
admin_route.get('/blockUser',adminController.blockUser);
admin_route.get('/addUsers',adminController.loadAddUsers);
admin_route.post('/addUsers',adminController.addUser);
admin_route.get('/editUsers',adminController.editUserLoad);
admin_route.post('/editUsers',adminController.updateUser);

admin_route.get('/productList',productController.loadProductList);
admin_route.get('/addProducts',productController.loadAddProducts);




admin_route.get('*',function(req,res){
    res.redirect('/admin');
})

module.exports = admin_route;
