const User=require('../models/userModel');
const bcrypt=require('bcrypt')

const securePassword=async(req,res)=>{
    try {
        const sPassword=await bcrypt.hash(password,10);
        return sPassword;
    } catch (error) {
        consloe.log(error.message);
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
            if(admin.is_admin!==0){
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
        const userData=await User.find({is_admin:0})
        res.render('userList',{users:userData})
    
    } catch (error) {
        console.log(error.message)
    }
}

const blockUser=async (req,res)=>{
    try {
        const {userId}= req.query
        console.log(userId)
        const data = await User.findOne({_id:userId});
        console.log(data)
        data.is_blocked=!data.is_blocked
       await data.save()
    } catch (error) {
        console.log(error.message)
    }
}





module.exports ={
    loadLogin,
    verifyLogin,
    loadHome,
    loadUserList,
    blockUser
}