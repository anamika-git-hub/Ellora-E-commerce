const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categories: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    // image: [{
    //     public_id: {
    //         type: String,
    //         required: true
    //     },
    //     url: {
    //         type: String,
    //         required: true
    //     }
    // }],
    image:{
        type:Array,
        validate:[arrayLimit,'You can pass only 4 images']
      },
    
    size: {
        type: Array
    },
    stock: {
        type: Number,
        required: true
    },
    is_listed: {
        type: Boolean,
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        default: null
    }
});

function arrayLimit(val){
    return val.length<=4
  }
  

module.exports = mongoose.model('products', productSchema);
