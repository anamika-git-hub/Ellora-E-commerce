const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Product = require('../models/productsModel');
const Wallet = require('../models/walletModel');
const Coupon = require('../models/couponModel');
const Razorpay = require('razorpay');
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;

const razorpayInstance = new Razorpay({
    key_id : RAZORPAY_ID_KEY,
    key_secret : RAZORPAY_SECRET_KEY
});


const placeOrder = async(req,res)=>{
    try {
        
        const userId = req.session.user_id;
        const couponCode = req.session.couponCode;

         console.log('code:',couponCode);
        const {shippingAddress,subTotal,shippingMethod} = req.body;
        const amount =subTotal*100
        if(shippingMethod == 'Razorpay'){
            const options = {
                amount:amount,
                currency:'INR',
                receipt :'anamikap9895@gmail.com'
            }
    
            razorpayInstance.orders.create(options,
            (err,order)=>{
                if(!err){
                    res.status(200).json({
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:RAZORPAY_ID_KEY,
                        // product_name:req.body.name,
                        // description:req.body.description,
                        contact:'9896754325',
                        name:'Anamika',
                        email:'anamikap9895@gmail.com'
                    })
                }else{
                    res.status(400).json({success:false,msg:'Something went wrong!'})
                }
            })
           
        }
        const userData = await User.findById({_id:userId});
        const address = userData.addresses.find((address=>{
            return address._id.equals(shippingAddress)
        }))
        const name = userData.name;
        const cartData = await Cart.findOne({userId:userId}).populate("products.productId")
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
        if(couponCode){
            var couponData = await Coupon.findOne({couponCode:couponCode});
            
        }
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
            couponDiscount:couponData.offerPrice,
            products:productData
        })
        res.redirect('/successPage');
        const orderData = await Order.findOne({userId:userId});
        const proData = orderData.products;
        for(let i=0;i<proData.length;i++){
        if(proData[i].status === 'placed'){
            // await Cart.deleteOne({userId:userId})
           for(let i=0;i<cartData.products.length;i++){
                const productId = productData[i].productId;
                const quantity = productData[i].quantity;
                console.log('quantity',quantity);

                // const result = await Product.updateOne({
                //     _id:productId
                // },{
                //     $inc:{
                //         stock : -quantity
                //     }
                // })
                const data = await Product.findOne({_id:productId});
                data.stock=data.stock-quantity;
                console.log('stock:',data.stock);
                 await  data.save()
                 res.redirect('/successPage');
            }
        }else if(proData[i].status === 'cancelled'){
            await Cart.deleteOne({userId:userId})
            for(let i=0;i<cartData.products.length;i++){
                 const productId = productData[i].productId;
                 const quantity = productData[i].quantity

                 await Product.updateOne({
                     _id:productId
                 },{
                     $inc:{
                         stock : quantity
                     }
                 })
             }
        }
        }
      
    } catch (error) {
        console.log(error.message);
    }
}

const loadSuccessPage = async(req,res)=>{
    try {
        res.render('successPage')
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderList = async(req,res)=>{
    try {
        var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 5;
        const orderData = await Order.find().populate('products.productId').populate('userId')
        .limit(limit * 1)
      .skip((page-1)* limit)
      .exec();
        
    const count = await Order.find({
    }).countDocuments();
        res.render('orderList',{orderData,totalPages:Math.ceil(count/limit),currentPage:page})
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.query; // Access orderId from req.params
        console.log('orderId:', orderId);
        const orderData = await Order.findById(orderId).populate('products.productId').populate('userId');
        res.render('orderDetail', { order: orderData });
    } catch (error) {
        console.log(error.message);
    }
};




const cancelOrder = async(req,res)=>{
    try {
        const {productId,orderId} = req.query;
        console.log('rode',req.query);
        const orderData = await Order.findOne({_id: orderId});
        console.log('orderData:',orderData.total_amount);
        const product = orderData.products.find((p)=>{
           return p.productId.equals(productId);
         
        });
        
        product.status="cancelled";
        await orderData.save()
        const userId = req.session.user_id
       if(product.status === 'cancelled'){
        const walletData = await Wallet.findOne({userId});
        if(walletData){
            walletData.walletAmount += product.totalPrice;
            walletData.walletHistory.push({
                date:new Date(),
                amount:product.totalPrice,
                description:'Order Cancellation',
                status:'In'
            })
           await walletData.save();
        }else{

            const newWallet = new Wallet({
                userId:req.session.user_id,
                walletAmount:product.totalPrice,
                walletHistory:[
                    {
                        date:new Date(),
                        amount:product.totalPrice,
                        description:'Order Cancellation',
                        status:'In'  
                    }
                ]
            })

            await newWallet.save()
        }
       }
       
    } catch (error) {
        console.log(error.message);
    }
}



const salesReport = async(req,res)=>{
    try {
        
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    placeOrder,
    loadSuccessPage,
    loadOrderList,
    cancelOrder,
    salesReport,
    loadOrderDetails
}