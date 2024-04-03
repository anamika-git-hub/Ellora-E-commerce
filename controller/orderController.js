const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


const placeOrder = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const {shippingAddress,subTotal,shippingMethod} = req.body;
       console.log('sh',shippingAddress);
       
        const userData = await User.findById({_id:userId});
        const address = userData.addresses.find((address=>{
            return address._id.equals(shippingAddress)
        }))
        console.log('add',address);
        const name = userData.name;
        const cartData = await Cart.findOne({userId:userId})
        const productData = cartData.products;
        
        const status = shippingMethod === "Cash on delivery" ? "placed" : "pending";
        const statusLevel = status === "placed" ? 1 : 0;


        const date = new Date();
        const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
        const deliveryDate = delivery.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }).replace(/\//g, '-');

        const myOrders = await Order.create({
            userId:userId,
            delivery_address:address,
            user_name:name,
            total_amount:subTotal,
            date:date,
            expected_delivery:deliveryDate,
            status:status,
            statusLevel:statusLevel,
            payment:shippingMethod,
            products:productData
        })

        console.log('mo',myOrders);


    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderList = async(req,res)=>{
    try {
        const orderData = await Order.find().populate('products.productId').populate('userId')
        console.log('od',orderData);
        res.render('orderList',{orderData})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    placeOrder,
    loadOrderList
}