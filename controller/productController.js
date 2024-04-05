
const category=require('../models/categoryModel')
const products= require('../models/productsModel')
const path = require('path');
const {joiProductSchema} = require('../models/ValidationSchema')
const uuid = require('uuid');
const { description } = require('@hapi/joi/lib/base');
const cloudinary = require("../utils/cloudinary");


const loadProductList=async(req,res)=>{
   try {

    var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 2;
    const productData = await products.find().populate({path:'categories',model:'categories'})
     .limit(limit * 1)
      .skip((page-1)* limit)
      .exec();
      
    const count = await products.find({
    }).countDocuments();


    res.render('productList',{products:productData,totalPages:Math.ceil(count/limit),currentPage:page})
   } catch (error) {
     console.log(error.message)
   }
    
}
const loadAddProducts = async(req,res)=>{
    try {
        const categoryData = await category.find({}) 
        res.render('addProducts',{categoryData});
    } catch (error) {
        console.log(error.message)
    }
}

const addProducts = async(req,res)=>{
    try {
       const value= await joiProductSchema.validateAsync(req.body)
       const {name,description,price,categories,image,stock} = value
       const product =  await products.create(
             {name:name,
             description:description,
             price:price,
             categories:categories,
             image:image.map(url => ({ url, _id: generateUniqueId() })),
             stock:stock,
             is_listed:true,
             size:['s','xs']
             })

             product.image.forEach((image)=>{
                console.log('id',image._id);
             })

             function generateUniqueId(){
                return uuid.v4();
             }

             console.log('pr',product);
                 res.redirect('/admin/productList')
       
    } catch (error) {
        console.log(error.message)
    }
}

const listProduct=async (req,res)=>{
    try {
        const {productId}= req.query
        const data = await products.findOne({_id:productId});
        data.is_listed=!data.is_listed
        const d1 =  await data.save();
    } catch (error) {
        console.log(error.message)
    }
}

const editProductLoad = async(req,res)=>{
    try{
        const id=req.query.id;
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
        const productData = await products.findOne({_id:req.body.id});
        const data = {
            name : req.body.name,
            description : req.body.description,
            price : req.body.price,
            category : req.body.category,
            price: req.body.price,
            stock: req.body.stock
        }

        if(req.body.image !==''){
            const imgId = productData.image._id;
            if(imgId){
                await cloudinary.uploader.destroy(imgId)
            }

            const newImage = await cloudinary.uploader.upload(req.body.image,{
                folder:"product-images"
            })
            data.image = {
                _id:newImage._id,
                url:newImage.secure_url
            }
        }

        if(productData){
        const pro = await products.findOneAndUpdate({_id:req.body.id},data);
          
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
    const productData = await products.find({is_listed:true})
    res.render('products.ejs',{products:productData});
   } catch (error) {
    console.log(error.message)
   }
}

const productDetails = async(req,res)=>{
    try {
        const {id} = req.query
        const productData = await products.findById({_id:id});
        res.render('productDetail',{products:productData})
    } catch (error) {
       console.log(error.message) 
    }
        
}

const sortProduct = async(req,res)=>{
    try {
        const {sortValue} = req.body;
        let sort;
        switch(sortValue){
            case 'Latest':
            sort = await products.find().sort({'_id':-1});
            res.send({ status: 'success', message: 'sorted successfully',sort});
            break;
            case 'Price high to low':
            sort = await products.find().sort({'price':-1});
            res.send({ status: 'success', message: 'sorted successfully',sort});
            break;
            case'Price low to high':
            sort = await products.find().sort({'price':1});
            res.send({ status: 'success', message: 'sorted successfully',sort});
            break;
            case'a to z':
            sort = await products.find().collation({ locale: 'en', strength: 1 }).sort({ 'name': 1 });
            res.send({ status: 'success', message: 'sorted successfully',sort});
            break;
            case'z to a':
            sort = await products.find().collation({ locale: 'en', strength: 1 }).sort({ 'name': -1 });
            res.send({ status: 'success', message: 'sorted successfully',sort});
            break;
            default:
                break;
        }
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
    productDetails,
    sortProduct
}