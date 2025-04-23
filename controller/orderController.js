const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel')
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
        const { shippingAddress, subTotal, paymentMethod } = req.body;
        console.log(paymentMethod);
        req.session.totalAmount = subTotal;
        const amount = subTotal * 100;

        const userData = await User.findById(userId);
        const address = userData.addresses.find(address => address._id.equals(shippingAddress));
        const name = userData.name;
        const cartData = await Cart.findOne({ userId: userId }).populate({ path: 'products.productId', populate: { path: 'offer' } });
        const productData = cartData.products;

        const status = paymentMethod === 'Wallet' ? 'Paid' : 'Pending';
        const statusLevel = status === 'Paid' ? 1 : 0;

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

        if(paymentMethod == 'Cash on delivery'){
             if(subTotal<1000){
               return res.json({message:'Only order above 1000 is allowed to cash on delivery'})
             }
        }

        if (paymentMethod === 'Wallet') {
            const walletData = await Wallet.findOne({ userId: req.session.user_id });
            if (walletData.walletAmount < subTotal) {
                return res.json({message: 'Your wallet does not have enough money' });
            } else {
                walletData.walletAmount -= subTotal;
                walletData.walletHistory.push({
                    date:new Date(),
                    amount:subTotal,
                    description:'Order Placed',
                    status:'Debited'
                })


                await walletData.save();
            }
        }

        let order = {
            userId: userId,
            delivery_address: address,
            user_name: name,
            total_amount: subTotal,
            date: date,
            expected_delivery: deliveryDate,
            status:status,
            statusLevel: statusLevel,
            payment: paymentMethod,
            couponDiscount: couponDiscount,
            offerDiscount: offerDiscount,
            products: productData
        }

        const myOrders = await Order.create(order);

        const proData = myOrders.products;
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

        if (paymentMethod === 'Razorpay') {
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: 'anamikap9895@gmail.com'
            };

          const RazorpayInstance =  razorpayInstance.orders.create(options, (err, order) => {
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
            res.status(200).json({ success: true, deliverySuccess: true ,orderId:myOrders._id });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};


const retryRazorpay = async(req,res)=>{
    try {
        const {orderId} = req.body;

        const orderData = await Order.findById(orderId)
        const amount = orderData.total_amount * 100;

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'anamikap9895@gmail.com'
        };

       razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                res.status(200).json({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    razorpayId:orderId,
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
        
    } catch (error) {
        console.log(error.message);
    }
}

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
        const {orderId}=req.query;
        const userId = req.session.user_id;
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate('userId').populate({ path: 'products.productId' });
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('userId').populate('products.productId');
        res.render('successPage',{orderId, userId, cartData, wishlistData})
    } catch (error) {
        console.log(error.message);
    }
}


const loadFailedPage = async(req,res)=>{
    try {
        const {orderId} = req.query;
        const userId = req.session.user_id;
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate('userId').populate({ path: 'products.productId' });
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('userId').populate('products.productId');
        res.render('failedPage',{orderId, userId, cartData, wishlistData})
    } catch (error) {
        console.log(error.message);
    }
}
const loadOrderList = async(req,res)=>{
    try {
        const itemsPerPage = 5;
        const currentOrderPage = parseInt(req.query.orderPage) || 1;

        const orderData = await Order.find().sort({ '_id': -1 }).populate('products.productId').populate('userId')
        .skip((currentOrderPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
        
 const totalOrders = await Order.countDocuments();
 const totalOrderPages = Math.ceil(totalOrders / itemsPerPage);
        res.render('orderList',{orderData,totalOrderPages,currentOrderPage})
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.query; 
        const orderData = await Order.findById(orderId).populate({ path: 'products.productId', populate: { path: 'offer' } }).populate('userId');
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
        await Product.updateOne({
            _id:productId
        },{
            $inc:{
                stock : product.quantity
            }
        })
        if(walletData){
            walletData.walletAmount += product.totalPrice;
            walletData.walletHistory.push({
                date:new Date(),
                amount:product.totalPrice,
                description:'Order Cancellation',
                status:'Credited'
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
                        status:'Credited'  
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
                     status:'Credited'
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
                             status:'Credited'  
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
        const  orderData = await Order.find().populate('products.productId').populate('userId');
        
        let count = 0;
        let grandTotal = 0;
        let couponTotal = 0;
        let offerTotal = 0;
        
        const DeliveredOrders = orderData.filter(order => 
          order.products.every(product => product.status === 'Delivered')
        );
        
        if (DeliveredOrders.length > 0) {
          count = DeliveredOrders.length;
        
          DeliveredOrders.forEach(order => {
            grandTotal += order.total_amount;
            couponTotal += order.couponDiscount;
            offerTotal += order.offerDiscount;
          });
        }
        res.render('salesReport', { orderData, grandTotal, couponTotal, offerTotal,count });
    } catch (error) {
        console.log(error.message);
    }
};

const filterSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        console.log('Received dates:', startDate, endDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 

        const query = {
            date: {
                $gte: start.toISOString(),
                $lte: end.toISOString()
            }
        };

        console.log('Query:', query);

        const filter = await Order.find(query).populate('userId');
        console.log('Filtered Orders:', filter);

        res.json({ status: 'success', message: 'sorted successfully', filter });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
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

const loadOrderInvoice = async (req, res) => {
    try {
        const { orderId } = req.query;

        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId').populate('userId');

        if (!orderData) {
            return res.status(404).send('Order not found');
        }
        res.render('Invoice', { orderData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const loadOrderHistory = async (req, res) => {
    try {
        
        const userId = req.session.user_id;
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate('userId').populate({ path: 'products.productId' });
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('userId').populate('products.productId');
        const orderId = req.query.orderId;
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId').populate('userId');

        if (!orderData) {
            return res.status(404).send('Order not found');
        }

        res.render('orderHistory', { orderData, userId, cartData, wishlistData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
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
    verifyPayment,
    filterSalesReport,
    loadFailedPage,
    loadOrderInvoice,
    loadOrderHistory,
    retryRazorpay
}