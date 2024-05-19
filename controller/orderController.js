const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Product = require('../models/productsModel');
const Wallet = require('../models/walletModel');
const Coupon = require('../models/couponModel');
const Razorpay = require('razorpay');
const excelJS = require('exceljs')
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id : RAZORPAY_ID_KEY,
    key_secret : RAZORPAY_SECRET_KEY
});


const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const couponCode = req.session.couponCode;
        const { shippingAddress, subTotal, shippingMethod } = req.body;
        console.log(shippingMethod);
        req.session.totalAmount = subTotal;
        const amount = subTotal * 100;

        const userData = await User.findById(userId);
        const address = userData.addresses.find(address => address._id.equals(shippingAddress));
        const name = userData.name;
        const cartData = await Cart.findOne({ userId: userId }).populate({ path: 'products.productId', populate: { path: 'offer' } });
        const productData = cartData.products;

        const status = shippingMethod === 'Cash on delivery' ? 'placed' : 'pending';
        const statusLevel = status === 'placed' ? 1 : 0;

        const date = new Date();
        const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
        const deliveryDate = delivery.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }).replace(/\//g, '-');
        let offerDiscount = 0;
        let couponDiscount = 0;
        if (couponCode) {
            const couponData = await Coupon.findOne({ couponCode: couponCode });
            couponDiscount = couponData ? couponData.offerPrice : 0;
            
            if (couponData) {
                const isCouponUsed = couponData.usedUsers.some(coupon => coupon.userId.equals(req.session.user_id));
                if (!isCouponUsed) {
                    couponData.usedUsers.push({ userId: req.session.user_id, status: true });
                    await couponData.save();
                }
            }
        }
        if (cartData) {
            productData.forEach(value => {
                if (value.productId.offer && value.productId.offer.status == true) {
                    const offer = value.productId.offer.offerPrice;
                    const productPrice = value.productPrice * value.quantity;
                    const offerPrice = (productPrice * offer) / 100;
                    offerDiscount += offerPrice;
                }
            });
        }

        if (shippingMethod === 'Wallet') {
            const walletData = await Wallet.findOne({ userId: req.session.user_id });
            console.log('walletData:', walletData.walletAmount);
            if (walletData.walletAmount < subTotal) {
                return res.json({message: 'Your wallet does not have enough money' });
            } else {
                walletData.walletAmount -= subTotal;
                console.log('subTotal:', subTotal);
                await walletData.save();
            }
        }

        let order = {
            userId: userId,
            delivery_address: address,
            user_name: name,
            total_amount: subTotal-couponDiscount-offerDiscount,
            date: date,
            expected_delivery: deliveryDate,
            status: status,
            statusLevel: statusLevel,
            payment: shippingMethod,
            couponDiscount: couponDiscount,
            offerDiscount: offerDiscount,
            products: productData
        }

        const myOrders = await Order.create(order);

        const orderData = await Order.findOne({userId:userId});
        const proData = orderData.products;
        for(let i=0;i<proData.length;i++){
            if(proData[i].status === 'placed'){
                await Cart.deleteOne({userId:userId})
               for(let i=0;i<cartData.products.length;i++){
                    const productId = productData[i].productId;
                    const quantity = productData[i].quantity
                    await Product.updateOne({
                        _id:productId
                    },{
                        $inc:{
                            stock : -quantity
                        }
                    })
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

        if (shippingMethod === 'Razorpay') {
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: 'anamikap9895@gmail.com'
            };

            console.log('orddddddddddd', myOrders._id);
            razorpayInstance.orders.create(options, (err, order) => {
                if (!err) {
                    res.status(200).json({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        razorpayId: myOrders._id,
                        amount: amount,
                        key_id: RAZORPAY_ID_KEY,
                        contact: '9896754325',
                        name: 'Anamika',
                        email: 'anamikap9895@gmail.com'
                    });
                } else {
                    res.status(400).json({ success: false, msg: 'Something went wrong!' });
                }
            });
        } else {
            res.status(200).json({ success: true, deliverySuccess: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};


const verifyPayment = async(req,res)=>{
    try {
        const {paymentId,orderId,signature,order} = req.body

        const hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY);
        hmac.update(orderId + '|' + paymentId);
        const hmacValue = hmac.digest('hex');
        console.log(hmacValue);

        if (hmacValue === signature) {
            const orderAck = await Order.findByIdAndUpdate({_id: order}, {status: 'Paid' });
            console.log(orderAck);
            console.log('Payment verification successful.');
            res.json({ message: "Payment Success" });

        } else {

            console.log('Payment verification failed.');
            res.json({ error: 'Signature mismatch' });

        }
    } catch (error) {
        res.render('404');
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
        const { orderId } = req.query; 
        const orderData = await Order.findById(orderId).populate('products.productId').populate('userId');
        const totalAmount = orderData.products.reduce((price,product)=>{
            return price + product.totalPrice
        })
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
           console.log('walletData:',walletData);
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

const returnProduct = async(req,res)=>{
    try {
        const {productId, orderId, reason } = req.body;
        console.log(req.body);
        const orderData = await Order.findById({_id:orderId});
        if(orderData.products && orderData.products.length>0){
            const product = orderData.products.find(product=>{
                return String(productId)=== String(productId);
            })
            if(product){
                product.status = 'Return Requested';
                product.returnReason = reason;

                await orderData.save()
                res.json({message:'Product return requested successfully.'})
            }else{
                res.json({error:'Product not found in the order.'});
            }
        }else{
            res.json({error:"Order is not found."})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const returnApproval = async(req,res)=>{
    try {
        const {status,productId, orderId,productPrice } = req.body;

        const orderData = await Order.findById({_id:orderId});
            const product = orderData.products.find(product=>{
                return String(productId)=== String(productId);
            })
        const userData = await User.findById({_id:req.session.user_id}).populate('wallet');

        
    if(status == 'Return Approved'){
             product.status = status;
             await orderData.save();
             const walletData = await Wallet.findOne({userId:req.session.user_id});
             if(walletData){
                 walletData.walletAmount += parseInt(productPrice);
                 walletData.walletHistory.push({
                     date:new Date(),
                     amount:productPrice,
                     description:'Order Returned',
                     status:'In'
                 })
                await walletData.save();
                console.log('walletData:',walletData);
             }else{
     
                 const newWallet = new Wallet({
                     userId:req.session.user_id,
                     walletAmount:parseInt(productPrice),
                     walletHistory:[
                         {
                             date:new Date(),
                             amount:productPrice,
                             description:'Order Returned',
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




const salesReport = async (req, res) => {
    try {
        let orderData;
        const { startDate, endDate } = req.query;

        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            console.log('Converted Start Date:', start);
            console.log('Converted End Date:', end);

            orderData = await Order.find({
                date: {
                    $gte: start,
                    $lte: end
                }
            }).populate('products.productId').populate('userId');
        console.log('Order Data:', orderData);

        } else {
           orderData = await Order.find().populate('products.productId').populate('userId');
        }
        let count = 0;
        let grandTotal = 0;
        let couponTotal = 0;
        let offerTotal = 0;
        
        const DeliveredOrders = orderData.filter(order => 
          order.products.every(product => product.status === 'Delivered')
        );
        
        console.log('delivere', DeliveredOrders);
        
        if (DeliveredOrders.length > 0) {
          count = DeliveredOrders.length;
        
          DeliveredOrders.forEach(order => {
            grandTotal += order.total_amount;
            couponTotal += order.couponDiscount;
            offerTotal += order.offerDiscount;
          });
        }
        
        console.log('Count:', count);
        console.log('Grand Total:', grandTotal);
        console.log('Coupon Total:', couponTotal);
        console.log('Offer Total:', offerTotal);

        res.render('salesReport', { orderData, grandTotal, couponTotal, offerTotal,count });
    } catch (error) {
        console.log(error.message);
    }
};




const statusChange = async(req,res)=>{
    try {
        console.log(req.body.status);
        
        const orderId = req.params.orderId;
        const order = await Order.findOne({_id:orderId});
        if(req.body.status== 'Shipped'){
            let productToUpdate = order.products.find(product=>product.status ==='placed')
            productToUpdate.status = 'Shipped';
            await order.save();
        }else if(req.body.status == 'Delivered'){
             let productToUpdate = null;
             for(const product of order.products){
                if(product.status === 'Shipped'){
                    productToUpdate = product;
                }
                
             }

             if(!productToUpdate){
                return res.json({error:'product is not shipped yet'})
             }

             productToUpdate.status = 'Delivered';
             await order.save();
        }
      

         return res.json({message:'Status updated successfully'})
    } catch (error) {
        console.log(error);
    }
}

const cancelStatusChange = async(req,res)=>{
    try {
     const {productId} = req.body;
     const {orderId} = req.params;

     const orderData =await  Order.findOne({_id:orderId})
     const product = orderData.products.find(product=>product._id == productId)
     if(product.status == 'cancelled'){
        return res.json({error:'Product is alread cancelled'});
     }

     if(product.status == 'Delivered'){
        return res.json({error:'Delivered products cannot be cancelled '});
     }

     product.status = 'Cancelled by Admin'
     await orderData.save();
      return res.json ({message:'Order status changed to Cancel'})
        
    } catch (error) {
        console.log(error);
    }
}



module.exports={
    placeOrder,
    loadSuccessPage,
    loadOrderList,
    cancelOrder,
    salesReport,
    loadOrderDetails,
    statusChange,
    cancelStatusChange,
    returnProduct,
    returnApproval,
    verifyPayment
}