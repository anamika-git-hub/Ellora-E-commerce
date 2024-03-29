const User=require('../models/userModel');
const bcrypt=require('bcrypt')
const randomstring =require('randomstring');

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
        console.log('kjdfks')
        const email = req.body.email;
        const password = req.body.password;
        const admin=await User.findOne({email:email})
        console.log(admin)
        if(admin){
            if(admin.is_admin!==process.env.EMAIL){
                const passwordMatch=await bcrypt.compare(password,admin.password);
                if(passwordMatch){
                    req.session.admin={
                        email:admin.email,
                        name:admin.name,
                        _id:admin._id
                    }
                    res.redirect('/admin/home')
                }else{
                    console.log('password is incorrect')
                    res.redirect('/')
                }
            }else{
                console.log('You are not the admin');
                res.redirect('/')
            }
        }else{
            console.log('You not even registered');
            res.redirect('/')
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
        var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 5;
    const userData=await User.find({email:{$ne:process.env.EMAIL}})
    
     .limit(limit * 1)
      .skip((page-1)* limit)
      .exec();
      console.log(userData);
      
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
        res.render('addUsers');
    } catch (error) {
        console.log(error.message)
    }
}

const addUser=async(req,res)=>{
    try {
        if(/^[A-Za-z]+(?:[A-Za-z]+)?$/.test(req.body.name)){
         const email = req.body.email;
         if(/^[A-Za-z0-9.%+-]+@gmail\.com$/.test(req.body.email)){
             const emailCheck = await User.findOne({email:email});
             if(!emailCheck){
                 let moblength = (req.body.mobile).length;
                 if(moblength>0 && moblength<=10){
                     const name = req.body.name;
                        const email = req.body.email;
                        const mobile = req.body.mobile;
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
                     res.render('addUsers',{message:"mobile number should be 10 degit"})
                 }
             }else{
                 res.render('addUsers',{message:" Email Already existed "})
             }
         }else{
             res.render('addUsers',{message:"Please check your Email structure "})
         }
        }else{
         res.render('addUsers',{message:"Invalid name"})
        }
       
 
 

    }catch(error){
        console.log(error.message);
    }
}

const editUserLoad = async(req,res)=>{
    try{

        const id=req.query.id;
       console.log(id)
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
            console.log(userData);
            res.redirect('/admin/userList')
        }else{
            res.render('editUsers',{users:user,message:'Email already exists'})
        }
        
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
    updateUser
}