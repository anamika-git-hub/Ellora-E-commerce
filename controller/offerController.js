const { joiOfferSchema } = require('../models/ValidationSchema');
const Offer = require('../models/offerModel');
const Product =require('../models/productsModel');
const Category = require('../models/categoryModel');

const loadOfferList = async(req,res)=>{
    try {
        const offerData = await Offer.find();
        res.render('offerList',{offerData});
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddOffer = async(req,res)=>{
    try {
        const productData = await Product.find();
        const categoryData = await Category.find();
        res.render('addOffer',{productData,categoryData})
    } catch (error) {
        console.log(error.message);
    }
}

const addOffer = async(req,res)=>{
    try {
        const value = await joiOfferSchema.validateAsync(req.body)
        const{name,ValidityDate,offerPrice,offerTypeName,offerType} = value
        const currentDate = new Date();
        console.log('cd',currentDate);
       
        const offerExpiredDate = new Date(ValidityDate)
        console.log('nd',offerExpiredDate)
        const offerData = await Offer.create({
            name:name,
            offerPrice:offerPrice,
            offerTypeName:offerTypeName,
            product:offerTypeName === 'Product'? offerType: undefined,
            category:offerTypeName === 'Category'? offerType: undefined,
            expiredAt:ValidityDate,
            status:offerExpiredDate>=currentDate?true:false
        })
        res.redirect('/admin/offerList');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadOfferList,
    loadAddOffer,
    addOffer
}