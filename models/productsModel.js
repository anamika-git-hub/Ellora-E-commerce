const mongoose=require('mongoose');

const productSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  quantity:{
    type:Number
  },
  image:{
    type:Array
  },
  size:{
    type:Array
  }

})

module.exports = mongoose.model('products',productSchema)