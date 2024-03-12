const mongoose= require('mongoose');

const categorySchema = new mongoose.Schema({
   name:{
    type:String,
   },
   description:{
    type:String
   },
   is_listed:{
      type:Boolean
   }
   
});

module.exports = mongoose.model('category',categorySchema)