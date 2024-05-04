const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    delivery_address:{
        type:Object,
        required:true
    },
    user_name:{
        type:String,
        required:true
    },
    total_amount:{
        type:Number,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    expected_delivery:{
        type:String,
        required:true
    },
    status:{
        type:String,
        
    },
    statusLevel:{
        type:Number,
        default:0
    },
    payment:{
        type:String,
        required:true
    },
    cancellationReason:{
        type:String,
        default:"none"
    },
    paymentId:{
        type:String
    },
    couponDiscount:{
      type:Number,
      default:0
    },
    offerDiscount:{
      type:Number,
      default:0
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'products',
            required:true
        },
        quantity:{
            type:Number,
            default:1
        },
        productPrice:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number,
            default:0
        },
        status:{
            type:String,
            default:"placed"
        }
    }]


});

module.exports = mongoose.model('Order',orderSchema)