const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    products : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'products',
                required : true
            },
            productPrice : {
                type : Number,
                required : true
            }
        }
    ]
});

module.exports = mongoose.model('Wishlist',wishlistSchema);