var express = require('express');
var adminRouter = express();
const session= require('express-session');


const config=require('../config/config');
adminRouter.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/adminAuth')

const imageUpload = require('../middleware/imageUploader');

adminRouter.use(express.json());
adminRouter.use(express.urlencoded({extended:true})); 



adminRouter.set('view engine','ejs');
adminRouter.set('views','./views/admin');

const adminController=require('../controller/adminController')
const productController=require('../controller/productController')
const categoryController=require('../controller/categoryController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const offerController = require('../controller/offerController');

adminRouter.get('/',isLogout,adminController.loadLogin);

adminRouter.post('/',adminController.verifyLogin);
adminRouter.get('/home',isLogin,adminController.loadHome);

adminRouter.get('/logout',isLogin,adminController.loadSignout);

adminRouter.get('/Categories',isLogin,categoryController.loadCategories);
adminRouter.get('/addCategories',isLogin,categoryController.loadAddCategories);
adminRouter.post('/addCategories',categoryController.insertCategory);
adminRouter.get('/listCategory',isLogin,categoryController.listCategory);
adminRouter.get('/editCategories',isLogin,categoryController.editCategoryLoad);
adminRouter.post('/editCategories',categoryController.updateCategories);

adminRouter.get('/userList',isLogin,adminController.loadUserList);
adminRouter.get('/blockUser',isLogin,adminController.blockUser);
adminRouter.get('/addUsers',isLogin,adminController.loadAddUsers);
adminRouter.post('/addUsers',adminController.addUser);
adminRouter.get('/editUsers',isLogin,adminController.editUserLoad);
adminRouter.post('/editUsers',adminController.updateUser);

adminRouter.get('/productList',isLogin,productController.loadProductList);
adminRouter.get('/addProducts',isLogin,productController.loadAddProducts);
adminRouter.post('/addProducts',imageUpload,productController.addProducts);
adminRouter.get('/listProduct',isLogin,productController.listProduct);
adminRouter.get('/editproducts',isLogin,productController.editProductLoad);
adminRouter.post('/editproducts',productController.updateProducts);

adminRouter.get('/couponList',isLogin,couponController.loadCouponList);
adminRouter.get('/addCoupon',isLogin,couponController.loadAddCoupon);
adminRouter.post('/addCoupon',isLogin,couponController.addCoupon);
adminRouter.get('/deleteCoupon',isLogin,couponController.deleteCoupon);
adminRouter.get('/editCoupon',couponController.loadEditCoupon);
adminRouter.post('/editCoupon',couponController.editCoupon);

adminRouter.get('/offerList',offerController.loadOfferList);
adminRouter.get('/addOffer',offerController.loadAddOffer);
adminRouter.post('/addOffer',offerController.addOffer);

adminRouter.get('/orderList',isLogin,orderController.loadOrderList);
adminRouter.get('/orderDetail', orderController.loadOrderDetails);

adminRouter.get('/salesReport',orderController.salesReport);





adminRouter.get('*',function(req,res){
    res.redirect('/admin');
})

module.exports = adminRouter;
