const User=require('../models/userModel');
const bcrypt=require('bcrypt')
const randomstring =require('randomstring');
const Order = require('../models/orderModel');
const {joiUserSchema} = require('../models/ValidationSchema');
const Product = require('../models/productsModel');


const securePassword=async(password)=>{
    try {
        const sPassword=await bcrypt.hash(password,10);
        return sPassword;
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin=async(req,res)=>{
    try {
        res.render('adminLogin')
    } catch (error) {
        console.log(error.message)
       
    }
}

const verifyLogin=async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const admin=await User.findOne({email:email})
        if(admin){
            if(admin.email==process.env.ADMIN_EMAIL){
                const passwordMatch=await bcrypt.compare(password,admin.password);
                if(passwordMatch){
                    req.session.admin={
                        email:admin.email,
                        name:admin.name,
                        _id:admin._id
                    }
                    req.session.admin_id = admin._id;
                    res.redirect('/admin/home')
                }else{
                    req.flash('login','Password is incorrect')
                    res.redirect('/admin/')
                }
            }else{
                req.flash('login','You are not the admin')
                res.redirect('/admin/')
            }
        }else{
            req.flash('login','You not even registered')
            res.redirect('/admin/')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try { 

        //--------------top Users------------//

        const userData = await User.find()
        const topUsers = await Order.aggregate([
        { $unwind: "$products" }, 
        { 
            $group: { 
                _id: "$userId", 
                totalProductsOrdered: { $sum: "$products.quantity" } 
            } 
        },
        { $sort: { totalProductsOrdered: -1 } }, 
        { $limit: 10 }
    ]);
    const userIds = topUsers.map(user => user._id);
    const users = await User.find({_id:{$in:userIds}})
        //------------------top products -------------------//
        const bestSellingProducts = await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    totalQuantity: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        const productIds = bestSellingProducts.map(product => product._id);
        const products = await Product.find({ _id: { $in: productIds } });

        for (const user of topUsers) {
            user.totalAmountPurchased = 0;
            for (const product of products) {
                const quantity = bestSellingProducts.find(p => p._id.equals(product._id))?.totalQuantity || 0;
                user.totalAmountPurchased += quantity * product.price;
            }
        }

  //-------------------- top categories ---------------//
  const categoryQuantities = await Order.aggregate([
    { $unwind: "$products" },
    {
        $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "product"
        }
    },
    { $unwind: "$product" },
    { $lookup: { from: "categories", localField: "product.categories", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    {
        $group: {
            _id: "$category._id",
            categoryName: { $first: "$category.name" },
            totalQuantity: { $sum: "$products.quantity" }
        }
    }
]);

const totalQuantityAllCategories = categoryQuantities.reduce((total, category) => total + category.totalQuantity, 0);

const bestSellingCategories = categoryQuantities.map(category => ({
    _id: category._id,
    categoryName: category.categoryName,
    totalQuantity: category.totalQuantity,
    percentage: (category.totalQuantity / totalQuantityAllCategories) * 100
})).sort((a, b) => b.percentage - a.percentage).slice(0, 10);

//-------------total amount  ,total order ,total products --------------//
const totalOrderStats = await Order.aggregate([
    {
        $group: {
            _id: null,
            totalAmount: { $sum: "$total_amount" },
            totalOrders: { $sum: 1 },
            totalProductsOrdered: { $sum: { $sum: "$products.quantity" } }
        }
    }
]);

//--------------------previous month total amount ----------------------//

const latestMonthStats = await Order.aggregate([
    {
        $match: {
            date: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        }
    },
    {
        $group: {
            _id: null,
            amountOrdered: { $sum: "$total_amount" }
        }
    }
]);

const totalAmount = totalOrderStats[0]?.totalAmount || 0;
const totalOrders = totalOrderStats[0]?.totalOrders || 0;
const totalProductsOrdered = totalOrderStats[0]?.totalProductsOrdered || 0;
const latestMonthAmount = latestMonthStats[0]?.amountOrdered || 0;


        res.render('adminHome',
         {
            bestSellingProducts,
            products ,
            topUsers ,
            users,
            bestSellingCategories,
            totalAmount,
            totalOrders,
            totalProductsOrdered,
            latestMonthAmount
        });
    } catch (error) {
        console.log(error.message);
    }
}


const orderChart = async (req, res) => {
    try {
        let array = Array.from({ length: 12 }).fill(0);
        const orderData = await Order.find().populate('products.productId').populate('userId');
        orderData.forEach(order => {
            order.products.forEach(product => {
                if (product.status === 'Delivered') {
                    const month = new Date(order.date).getMonth();
                    array[month]++;
                }
            });
        });
        
        res.send({ array });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ error: error.message });
    }
};



const loadUserList=async(req,res)=>{
    try {
        let userQuery = {email:{$ne:process.env.ADMIN_EMAIL}}
        var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 5;
    if (req.query.search && req.query.search.trim() !== '') {
        const searchPattern = new RegExp(req.query.search.trim(), 'i').source;
        console.log('searchPattern:', searchPattern); 
    
        userQuery = {$and:[{email:{$ne:process.env.ADMIN_EMAIL}},{
                 $or: [{ name: { $regex: searchPattern } }, { description: { $regex: searchPattern } }] }]
        };
    }
    const userData=await User.find(userQuery)
    
     .limit(limit * 1)
      .skip((page-1)* limit)
      .exec();
      
    const count = await User.find(userQuery).countDocuments();
    
        
        res.render('userList',{users:userData,totalPages:Math.ceil(count/limit),currentPage:page})
    
    } catch (error) {
        console.log(error.message)
    }
}

const blockUser = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await User.findOne({ _id: userId });

        if (user) {
            user.is_blocked = !user.is_blocked;
            await user.save();

            // If the user is currently logged in, destroy their session
            if (req.session.user_id === userId && user.is_blocked) {
                req.session.destroy((err) => {
                    if (err) {
                        console.log('Error destroying session:', err);
                    } else {
                        res.status(200).json({ message: 'User blocked and logged out' });
                    }
                });
            } else {
                res.status(200).json({ message: 'User blocked/unblocked successfully' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loadAddUsers = async(req,res)=>{
    try {
        
        const messages = req.flash('messages')[0] || {}; 
        const formData = req.flash('formData')[0] || {};
        res.render('addUsers',{messages,formData});
    } catch (error) {
        console.log(error.message)
    }
}

const addUser=async(req,res)=>{
    try {
        const { error } = joiUserSchema.validate(req.body,{password:2}, {
            abortEarly: false
          });
    if(error){ 
        const errorMessages = error.details.reduce((acc, cur) => {
            acc[cur.context.key] = cur.message;
            return acc;
        }, {});
        req.flash('messages', errorMessages);
        req.flash('formData', req.body);
        res.redirect('/admin/addUsers')
    }
        const value = await joiUserSchema.validateAsync(req.body)
       
        const {name,email,mobile} = value;

        
             const emailCheck = await User.findOne({email:email});
             if(!emailCheck){
                        const password = randomstring.generate(8);
                        
                        const spassword = await securePassword(password)
                 
                       const user1 =  new User({
                           name:name,
                           email:email,
                           mobile:mobile,
                           password: spassword,
                           is_admin:0,
                           is_blocked:0,
                           is_verified:0
                        });
                 
                        const userData = await user1.save();
                 
                        if(userData){
                           
                           res.redirect('/admin/userList');
                        }else{
                         res.render('addUsers',{message:"Somthing wrong..."});
                        }
                
             }else{
                 res.render('addUsers',{message:" Email Already existed "})
             }
         
       
       
 
 

    }catch(error){
        console.log(error.message);
    }
}

const editUserLoad = async(req,res)=>{
    try{

        const id=req.query.id;
        const userData=await User.findById({_id:id});
        if(userData){
            res.render('editUsers',{users:userData})
        }else{
            res.redirect('/admin/userList');
        }
    }catch(error){
        console.log(error.message);
    }
}

const updateUser = async (req,res)=>{
    try {
        const user = await User.findOne({_id:req.body.id})
        const existingUser = await User.findOne({email:req.body.email});
        if(existingUser._id==req.body.id){
            const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}});
           
            res.redirect('/admin/userList')
        }else{
            res.render('editUsers',{users:user,message:'Email already exists'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadSignout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}





module.exports ={
    loadLogin,
    verifyLogin,
    loadHome,
    loadUserList,
    blockUser,
    loadAddUsers,
    addUser,
    editUserLoad,
    updateUser,
    loadSignout,
    orderChart,
}