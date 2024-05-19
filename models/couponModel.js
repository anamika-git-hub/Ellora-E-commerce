const mongoose = require('mongoose');

const couponModel = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'active'
    },
    expiryDate:{
        type:Date,
        required:true
    },
    offerPrice:{
        type:Number,
        required:true
    },
   
    minimumLimit:{
        type:Number,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    usedUsers:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        status:{
            type:Boolean,
            default:false
        }
       
    }],
    is_listed:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('Coupon',couponModel)