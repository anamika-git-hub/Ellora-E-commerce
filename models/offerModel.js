const mongoose = require('mongoose');

const offerModel = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    item:{
        type:String,
        require:true
    },
    offerRate:{
        type:String,
        require:true
    },
    validity:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model('Offer',offerModel)