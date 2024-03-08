const User=require('../models/userModel');
const loadProductList=async(req,res)=>{
    try {
        res.render('productList')
    } catch (error) {
        console.log(error.message);
    }
}

const loadCategories=async(req,res)=>{
    try {
        res.render('adminCategories')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    loadProductList,
    loadCategories
}