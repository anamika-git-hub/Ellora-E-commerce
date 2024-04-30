const { required } = require('joi');
const mongoose = require('mongoose');

const offerModel = new mongoose.Schema({
    name:{type:String,required:true,trim:true},
    description:{type:String},
    offerPrice:{type:Number,required:true},
    offerTypeName:{type:String,required:true},
    product:{type:String},
    category:{type:String},
    expiredAt:{type:Date,required:true},
    status:{type:Boolean}
})

module.exports = mongoose.model('Offer',offerModel)