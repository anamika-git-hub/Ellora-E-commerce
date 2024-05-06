
const category=require('../models/categoryModel');
const products= require('../models/productsModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const path = require('path');
const {joiProductSchema} = require('../models/ValidationSchema')
const uuid = require('uuid');
const cloudinary = require("../utils/cloudinary");
const Offer = require('../models/offerModel');
const mongoose = require('mongoose')


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
         await products.create(
             {name:name,
             description:description,
             price:price,
             categories:categories,
             image:image,
             stock:stock,
             is_listed:true,
             size:['s','xs']
             })
                 res.redirect('/admin/productList')
       
    } catch (error) {
        console.log(error.message)
    }
}


// const addProducts = async(req,res)=>{
//     try {
//         console.log('body:',req.body);
//        const value= await joiProductSchema.validateAsync(req.body)
//        const {name,description,price,categories,image,stock} = value
//        const result = await cloudinary.uploader.upload(image, {
//         folder: "products",
//         // width: 300,
//         // crop: "scale"
//     })

//          await products.create(
//              {name:name,
//              description:description,
//              price:price,
//              categories:categories,
//              image:{
//                   public_id:result.public_id,
//                   url:result.secure_url
//              },
//              stock:stock,
//              is_listed:true,
//              size:['s','xs']
//              })
//                  res.redirect('/admin/productList')
       
//     } catch (error) {
//         console.log(error.message)
//     }
// }

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

            const newImage = await cloudinary.uploader.upload(req.body.image,file.path,{
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
    console.log('filter',req.query);
    const queryObj = {...req.query};
    // console.log('qo',queryObj.minPrice ,queryObj.maxPrice ,queryObj.categories);
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 12;
    let productQuery = {is_listed:true}
        
    // console.log('productQuery:',productQuery);
    // console.log('productQuery:',queryObj);

    // if(queryObj.categories){
    //     const categories = queryObj.categories.split(',')
    //     productQuery = {
    //         ...productQuery,"categories.name":{$in:categories}
    //     }
    // }
    // if (queryObj.minPrice && queryObj.maxPrice && queryObj.categories) {
    //     const categories = queryObj.categories.split(',');
    //     productQuery = {
    //         ...productQuery,
    //         price: {'$gte': parseFloat(queryObj.minPrice), '$lte': parseFloat(queryObj.maxPrice)},
    //         "categories.name": {$in: categories}
    //     };
    
    // } 
    // else if (queryObj.minPrice && queryObj.maxPrice) {
    //     productQuery = {
    //         ...productQuery,
    //         price: { '$gte': parseFloat(queryObj.minPrice), '$lte': parseFloat(queryObj.maxPrice)}
    //     }
    // }

    const sortOptions = {
        Latest: {_id:-1},
        PriceHighTolow : {price:-1},
        PriceLowtoHigh: { price:1},
        aToz:{name:1},
        zToa:{name:-1}
    }
    

    const sort = sortOptions[req.query.sort] || {name:1}

    if (req.query.search) {
        const searchPattern = new RegExp(`.*${req.query.search.trim()}.*`, 'i');
        productQuery['$or'] = [{ name: searchPattern }, { description: searchPattern }];
      }

        //   console.log('prqo',productQuery);
        const productData = await products.find(productQuery).populate({path:'categories',model:'categories'}).populate('offer')
            .sort(sort)
            .limit(limit)
            .skip((page - 1) * limit)  ;



    const count = await products.countDocuments(productQuery);
    const cartData = await Cart.findOne({userId:req.session.user_id}).populate('userId').populate({path:'products.productId'});
    const wishlistData = await Wishlist.findOne({userId:req.session.user_id}).populate('userId').populate('products.productId');
    const categoryData = await category.find();
    const offerData = await Offer.find();
    if(offerData ){
        for(const offer of offerData){
           if(offer.offerTypeName === 'Product'){
               const type = offer.product
                const matchingProducts = productData.filter(product=>product._id == type);
                for (const matchingProduct of matchingProducts) {
                   const offerId = offer._id;
                   if(offer.status == true){
                       await products.updateOne({_id:matchingProduct._id},{
                           offer:offerId
                       })
                   }
                   
               }
   
           }
        }
       }
    

    res.render('products',{products:productData,cartData,wishlistData,categoryData,totalPages:Math.ceil(count/limit),currentPage:page});
   } catch (error) {
    console.log(error)
   }
}



// const productPage = async(req,res) => {
//     try {
//         console.log(req.query);
//         const {minPrice, maxPrice, sort} = req.query;
//         const queryObj = {...req.query};
//         const page = req.query.page ? parseInt(req.query.page) : 1;
//         const limit = 12;
//         // let productQuery = {is_listed:true}
//         // if (queryObj.minPrice && queryObj.maxPrice && queryObj.categories) {
//         //     const categories = queryObj.categories.split(',');
//         //     productQuery = {
//         //         ...productQuery,
//         //         price: {'$gte': parseFloat(queryObj.minPrice), '$lte': parseFloat(queryObj.maxPrice)},
//         //         "categories.name": {$in: categories}
//         //     };
        
//         // } else if (queryObj.minPrice && queryObj.maxPrice) {
//         //     productQuery = {
//         //         ...productQuery,
//         //         price: { '$gte': parseFloat(queryObj.minPrice), '$lte': parseFloat(queryObj.maxPrice)}
//         //     }
//         // }


//         // const productData = await products.find(productQuery).populate({path:'categories',model:'categories'}).populate('offer')
//         //     .limit(limit)
//         //     .skip((page - 1) * limit)  ;
//         // console.log(productQuery,productData)
//         console.log("================================================================")
//         console.log(minPrice,maxPrice)
//         let query = {price:{$gte:minPrice || 0,$lte:maxPrice || 750}}
//         const Xproducts = await products.find(query);
//         console.log(Xproducts)
//         console.log("================================================================")

//         if(req.query.filter){
//            return res.json({products:Xproducts}) ;
//         }
//         res.render('Xproducts',{hello:Xproducts})
//     } catch (error) {
//         console.log(error)
//     }
// }

const searchProducts = async(req,res)=>{
    try {
        const { query } = req.query;
        console.log('query:',query);
        const regex = new RegExp(query, 'i'); 
        
        const products = await products.find({ name: { $regex: regex } });
        res.json(products); 
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const productDetails = async(req,res)=>{
    try {
        const {id} = req.query
        const productData = await products.findById({_id:id});
        const wishlistData = await Wishlist.findOne({userId:req.session.user_id}).populate('userId').populate('products.productId');
        const cartData = await Cart.findOne({userId:req.session.user_id}).populate('userId').populate({path:'products.productId'});
        res.render('productDetail',{products:productData,cartData,wishlistData})
    } catch (error) {
       console.log(error.message) 
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
    searchProducts
}