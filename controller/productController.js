const User=require('../models/userModel');
const category=require('../models/categoryModel')
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
const deleteCategories = async(req,res)=>{
    try {
        const id = req.query.id;
        await category.deleteOne({id:id});
        res.redirect('/admin/adminCategories')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    loadProductList,
    loadCategories,
    deleteCategories
}