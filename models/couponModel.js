const mongoose = require('mongoose');

const couponModel = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    status:{
        type:Date,
        enum:['active','expired']
    },
    expiryDate:{
        type:String,
        require:true
    },
    offer:{
        type:Number,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    miniLimit:{
        type:Number,
        require:true
    },
    couponId:{
        type:String,
        require:true
    },
    usedUsers:{
        type:Array,
        default:[]
    }
})

module.exports = mongoose.model('Coupon',couponModel)