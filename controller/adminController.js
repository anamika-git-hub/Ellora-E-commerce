const User=require('../models/userModel');
const bcrypt=require('bcrypt')
const randomstring =require('randomstring');
const {joiUserSchema} = require('../models/ValidationSchema');


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
            if(admin.email==process.env.EMAIL){
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

const loadHome=async(req,res)=>{
    try {
        res.render('adminHome');
    } catch (error) {
        console.log(error.message)
    }
}

const loadUserList=async(req,res)=>{
    try {

        console.log('re',req.query);
        let userQuery;
        var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 5;
    if (req.query.search && req.query.search.trim() !== '') {
        const searchPattern = new RegExp(req.query.search.trim(), 'i').source;
        console.log('searchPattern:', searchPattern); 
    
        userQuery = {$and:[{email:{$ne:process.env.EMAIL}},{
                 $or: [{ name: { $regex: searchPattern } }, { description: { $regex: searchPattern } }] }]
        };
    }
    const userData=await User.find(userQuery)
    
     .limit(limit * 1)
      .skip((page-1)* limit)
      .exec();
      
    const count = await User.find({
    }).countDocuments();
    
        
        res.render('userList',{users:userData,totalPages:Math.ceil(count/limit),currentPage:page})
    
    } catch (error) {
        console.log(error.message)
    }
}

const blockUser=async (req,res)=>{
    try {
        const {userId}= req.query
        const data = await User.findOne({_id:userId});
        data.is_blocked=!data.is_blocked
       await data.save()
    } catch (error) {
        console.log(error.message)
    }
}

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
    loadSignout
}