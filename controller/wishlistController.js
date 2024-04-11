const User = require('../models/userModel');
const Product = require('../models/productsModel');
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel');

const loadWishlist = async(req,res)=>{
    try {
        if(!req.session.user_id){
            console.log('please login to get our services');
            return res.redirect('login')
        }else{
          const  userId = req.session.user_id;
          const wishlistData = await Wishlist.findOne({userId:userId}).populate('userId').populate('products.productId');
          const cartData = await Cart.findOne({userId:userId}).populate('userId').populate({path:'products.productId'});
            res.render('wishlist',{wishlistData,cartData});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addtoWishlist = async(req,res)=>{
    try {
        const {productId} = req.body;
        const productData = await Product.findById({_id:productId});
        const wishlistData = await Wishlist.findOne({userId:req.session.user_id});
        if(!req.session.user_id){
            res.json({login:true})
        }else{
            if(wishlistData){
                const existProduct = wishlistData.products.find((pro)=>pro.productId.toString()==productId);
                if(existProduct){

                }else{
                    await Wishlist.findOneAndUpdate({
                        userId:req.session.user_id
                    },{
                        $push:{
                            products:{
                                productId:productId,
                                productPrice:productData.price
                            }
                        }
                    })
                }
            }else{
                const newWishlist = new Wishlist({
                    userId:req.session.user_id,
                    products:[
                        {
                        productId:productId,
                        productPrice:productData.price
                    }
                ]
                })
                await newWishlist.save();
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteWishlistItem = async(req,res)=>{
    try {

        const { productId } = req.body;
        const wishlistData = await Wishlist.findOneAndUpdate({userId:req.session.user_id},{$pull:{products:{productId}}})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadWishlist,
    addtoWishlist,
    deleteWishlistItem
    
}