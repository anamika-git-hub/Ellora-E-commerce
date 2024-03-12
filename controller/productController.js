const User=require('../models/userModel');
const category=require('../models/productsModel')
const products= require('../models/productsModel')
const loadProductList=async(req,res)=>{
    try {
        const productData = await products.find()
        res.render('productList',{products:productData})
    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProducts = async(req,res)=>{
    try {
        res.render('addProducts');
    } catch (error) {
        console.log(error.message)
    }
}




module.exports={
    loadProductList,
    loadAddProducts
}