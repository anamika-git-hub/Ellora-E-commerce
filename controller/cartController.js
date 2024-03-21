const User = require('../models/userModel')
const Cart = require('../models/cartModel');
const Product = require('../models/productsModel');
const { query } = require('express');

const loadCart = async(req,res)=>{
    try {
        if(!req.session.user_id){
            console.log('please login to get our service')
            res.redirect('/login')
        }else{

            const userId = req.session.user_id;
            const cartData = await Cart.findOne({userId:userId}).populate('userId').populate({path:'products.productId'});
            let initialAmount = 0;
            if(cartData){
                cartData.products.forEach((item)=>{
                    let itemPrice = item.productPrice;
                    initialAmount += itemPrice*item.quantity
                })
            }
            res.render('cart',{cartData, subTotal : initialAmount});
        }

    }catch (error){
        console.log(error.message);
    }
}

const addtoCart = async(req,res)=>{
    try {
        const {productId,productQuantity} = req.body;
        const productData = await Product.findById({_id:productId});
        const cartData = await Cart.findOne({userId:req.session.user_id});
        if(cartData){
            const existProduct = cartData.products.find((pro)=>pro.productId.toString()== productId);
            if(existProduct){
                
                console.log('This product already exists in cart');
            } else{
            await Cart.findOneAndUpdate({
                userId :req.session.user_id
            },{
                $push: {
                    products:{
                        productId : productId,
                        quantity :productQuantity,
                        productPrice : productData.price,
                        totalPrice : productQuantity* productData.price
                    }
                }
            })
        }
    }else{
        const newCart = new Cart ({
            userId : req.session.user_id,
            products : [
                {
                    productId : productId,
                    quantity : productQuantity,
                    productPrice : productData.price,
                    totalPrice : productQuantity* productData.price
                }
            ]
           
        })
        
        await newCart.save();
    }
    } catch (error) {
        console.log(error.message);
    }
}

const updatequantity = async(req,res)=>{
    try {
        const {productId,productQuantity} = req.body;
        const cartData = await Cart.findOne({userId:req.session.user_id});
        
        const products = cartData.products.find((product)=>product.productId.equals(productId))
        products.quantity=productQuantity
        products.totalPrice=productQuantity* products.productPrice
        await cartData.save()
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCartItem = async(req,res)=>{
    console.log('try');
    try {
        console.log('kldjl');
        const userId = req.session.user_id;
        console.log('userId',userId);
        const productId = req.body.product;

        console.log('proId',productId);
        const cartData = await Cart.findOne({userId:userId});

        if(cartData){
            await Cart.findOneAndUpdate(
                {userId:userId},
                {$pull:{products:{productId:productId}},
            }
            );
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckOut = async(req,res)=>{
   try {
      res.render('checkout');
   } catch (error) {
    console.log(error.message);
   }
}


module.exports = {
    loadCart,
    addtoCart,
    updatequantity,
    deleteCartItem,
    loadCheckOut
}