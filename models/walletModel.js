const mongoose=require('mongoose');

const walletSchema = new mongoose.Schema({
    walletAmount:{
        type:Number},

    walletHistory:[{
          date:{
            type:Date
          },
          amount:{
            type:Number
          },
          description:{
            type:String
          },
          status:{
            type:String
          }
        }],
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'},
})

module.exports=mongoose.model('Wallet',walletSchema)