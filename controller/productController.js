
const category=require('../models/productsModel')
const products= require('../models/productsModel')
const sharp = require('sharp');
const path = require('path');



const loadProductList=async(req,res)=>{
    try {
        const productData = await products.find({}).populate('categories')
        const categoryData = await category.find({})
        res.render('productList',{products:productData,categories:categoryData})
    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProducts = async(req,res)=>{
    try {
        const productData= await products.find({})
        const categoryData = await category.find({}) 
        
        res.render('addProducts',{categories:categoryData,products:productData});
    } catch (error) {
        console.log(error.message)
    }
}

const addProducts = async(req,res)=>{
   
    try {
        // let arrImages= [];
        // if(Array.isArray(req.files)){
        //     for(let i=0;i<req.files.length;i++){
        //         arrImages.push(req.files[i].images);
        //         const outputPath=path.resolve(__dirname,'..','public','admin','assets','imgs','products',req.files[i].images)
        //         await sharp(req.files[i].path).resize(500,500).toFile(outputPath);
        //     }
        // }
       
          
        const Product = new products({
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            categories:req.body.category,
            image:req.body.image,
            is_listed:true
        });
        console.log(req.body.category)
        
        await Product.save();
        res.redirect('/admin/productList')
    } catch (error) {
        console.log(error.message)
    }
}

const listProduct=async (req,res)=>{
    try {
        const {productId}= req.query
        console.log(productId)
        const data = await products.findOne({_id:productId});
        console.log(data)
        data.is_listed=!data.is_listed
     const d1 =  await data.save();
      console.log(d1) 
    } catch (error) {
        console.log(error.message)
    }
}

const editProductLoad = async(req,res)=>{
    try{

        const id=req.query.id;
       console.log(id)
        const productData=await products.findById({_id:id})
        const categoryData=await category.find()
        if(productData){
            res.render('editProducts',{categories:categoryData,products:productData})
        }else{
            res.redirect('/admin/productList');
        }
    }catch(error){
        console.log(error.message);
    }
}

const updateProducts = async (req,res)=>{
    try {
        const productData = await products.findOne({_id:req.body.id})
        
        if(productData){
            const productData = await products.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,description:req.body.description,categories:req.body.category,price:req.body.price,image:req.body.image}});
            console.log(productData);
            res.redirect('/admin/productList')
        }else{
            res.render('editProducts',{products:productData,message:'Category already exists'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const productPage = async(req,res)=>{
    try {
        const productData = await products.find({})
        res.render('products.ejs',{products:productData});
    } catch (error) {
        console.log(error.message);
    }
}

const productDetails = async(req,res)=>{
    try {
        const id = req.query.id;
        console.log(id);
        const productData = await products.findById(id);
        res.render('productDetail',{products:productData})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadProductList,
    loadAddProducts,
    addProducts,
    listProduct ,
    editProductLoad,
    updateProducts,
    productPage,
    productDetails
}