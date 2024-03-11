const mongoose= require('mongoose');

const categorySchema = new mongoose.Schema({
   name:{
    type:String,
   },
   description:{
    type:String
   },
   status:{
    type:Boolean
   }
});

module.exports = mongoose.model('category',categorySchema)