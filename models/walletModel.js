const mongoose=require('mongoose');

const walletSchema = new mongoose.Schema({
    walletAmount:{
        type:String,
        required:true},
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'},
})

module.exports=mongoose.model('Wallet',walletSchema)