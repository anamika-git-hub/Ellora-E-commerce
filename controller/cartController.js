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

            const userId = req.session.user_id
            const cartData = await Cart.findOne({userId:userId}).populate('userId').populate({path:'products.productId'});
            console.log("cart",cartData);
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
        const productId = req.query.id;
        const productData = await Product.findById({_id:productId});
        const cartData = await Cart.findOne({userId:req.session.user_id});
        if(cartData){
            const existProduct = cartData.products.find((pro)=>pro.productId.toString()== productId);
            if(existProduct){
                await Cart.findOneAndUpdate({
                    userId : req.session.user_id,
                    "products.productId" : productId
                },{
                    $inc : {
                        
                    }
                })
            } else{
                console.log('quantity',req.body.productQuantity);
            await Cart.findOneAndUpdate({
                userId :req.session.user_id
            },{
                $push: {
                    products:{
                        productId : productId,
                        quantity :req.body.productQuantity,
                        productPrice : productData.price,
                        totalPrice :  productData.price
                    }
                }
            })
        }
    }else{
        console.log(req.session.user_id);
        const newCart = new Cart ({
            userId : req.session.user_id,
            products : [
                {
                    productId : productId,
                    quantity : req.body.productQuantity,
                    productPrice : productData.price,
                    totalPrice :  productData.price
                }
            ]
           
        })
        
        await newCart.save();
    }
    } catch (error) {
        console.log(error.message);
    }
}

const updateCart = async (req, res) => {
    try {
        const { productId, productQuantity } = await req.body;
        const userId = req.session.user_id;

        // Update the quantity of the product in the cart
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId, "products.productId": productId },
            { $set: { "products.$.quantity": productQuantity } },
            { new: true } // To return the updated document
        );
        console.log(updateCart);
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    loadCart,
    addtoCart,
    updateCart
}