const { joiOfferSchema } = require('../models/ValidationSchema');
const Offer = require('../models/offerModel');
const Product =require('../models/productsModel');
const Category = require('../models/categoryModel');

const loadOfferList = async(req,res)=>{
    try {

        const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 5;
        const offerData = await Offer.find()
        .limit(limit)
        .skip((page - 1) * limit)  ;
        
    const count = await Offer.countDocuments();
        res.render('offerList',{offerData,totalPages:Math.ceil(count/limit),currentPage:page});
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
        const offerExpiredDate = new Date(ValidityDate)
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

const listOffer= async (req,res)=>{
    try {
        const {OfferId}= req.query
        const data = await Offer.findOne({_id:OfferId});
        data.is_listed=!data.is_listed
        const d1 =  await data.save();
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditOffer = async(req,res)=>{
    try {
        const productData = await Product.find();
        const categoryData = await Category.find();
        const offerData = await Offer.findById({_id:req.query.id});
        res.render('editOffer',{offerData,productData,categoryData})
    } catch (error) {
        console.log(error.message);
    }
}

const editOffer = async(req,res)=>{
    try {
        const {OfferId} = req.query
        console.log('offerId:',OfferId);
        const value = await joiOfferSchema.validateAsync(req.body);
        console.log('value:',value);
        const {name,ValidityDate,offerPrice,offerTypeName,offerType} = value;
        const OfferData = await Offer.findOneAndUpdate({_id:OfferId},{$set:{name:name,offerPrice:offerPrice,offerTypeName:offerTypeName,product:offerTypeName === 'Product'? offerType:undefined,category:offerTypeName === 'Category'?offerType:undefined,expiredAt:ValidityDate}})

        console.log('offerData:',OfferData);
        res.redirect('/admin/OfferList')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadOfferList,
    loadAddOffer,
    addOffer,
    listOffer,
    loadEditOffer,
    editOffer
}