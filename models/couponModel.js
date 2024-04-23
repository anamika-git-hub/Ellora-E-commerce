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
   
    miniLimit:{
        type:Number,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    usedUsers:{
        type:Array,
        default:[]
    },
    is_listed:{
        type:Boolean,
        required:true,
        default:true
    }
})

module.exports = mongoose.model('Coupon',couponModel)