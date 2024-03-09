const User=require('../models/userModel');
const bcrypt=require('bcrypt')

// const securePassword=async(req,res)=>{
//     try {
//         const sPassword=await bcrypt.hash(password,10);
//         return sPassword;
//     } catch (error) {
//         consloe.log(error.message);
//     }
// }

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
        const admin=User.findOne({email:email})
        if(admin){
            if(admin.is_admin!==0){
                const passwordMatch=await bcrypt.compare(password,admin.password);
                if(passwordMatch){
                    req.session.admin={
                        email:admin.email,
                        name:admin.name,
                        _id:admin._id
                    }
                }else{
                    console.log('password is incorrect')
                    res.redirect('/adminHome')
                }
            }else{
                console.log('You are not the admin');
                res.redirect('/adminLogin')
            }
        }else{
            console.log('You not even registered');
            res.redirect('/adminLogin')
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





module.exports ={
    loadLogin,
    verifyLogin,
    loadHome,
   
}