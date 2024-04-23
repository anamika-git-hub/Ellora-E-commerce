const Offer = require('../models/offerModel');

const offerLoad = async(req,res)=>{
    try {
        const data = await Offer.find();
        res.render('offerList',{Offer:data});
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    offerLoad
}