const mongoose=require('mongoose');

const productSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  categories:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:('category')
  },
  price:{
    type:Number,
    required:true
  },
  image:{
    type:Array,
    validate:[arrayLimit,'you can pass only 4 images']
  },
  size:{
    type:Array,
    required:true
  },
  is_listed:{
    type:Boolean,
    required:true
  }

})

function arrayLimit(val){
  return val.length<=3
}

module.exports = mongoose.model('products',productSchema)