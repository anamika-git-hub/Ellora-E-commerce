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
    type:Number,
    required:true
  },
  image:{
    type:Array,
    required:true
  },
  size:{
    type:Array,
    required:true
  }

})

module.exports = mongoose.model('products',productSchema)