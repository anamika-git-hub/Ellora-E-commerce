const { joiCouponSchema } = require('../models/ValidationSchema');
const { off } = require('../models/categoryModel');
const Coupon = require('../models/couponModel');


const loadCouponList = async(req,res)=>{
    try {
        const couponData = await Coupon.find({})
        res.render('couponList',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCoupon = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async(req,res)=>{
    try {
        const value = await joiCouponSchema.validateAsync(req.body)
        console.log('val',value);
        const {name,ValidityDate,offerPrice,maximumLimit,image} = value;
        const data = Coupon.create({
            name:name,
            expiryDate:ValidityDate,
            offerPrice:offerPrice,
            miniLimit:maximumLimit,
            image:image,
        })
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCoupon = async(req,res)=>{
    try {
        const couponData = await Coupon.findById({_id:req.body.id});
        res.render('editCoupon',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCouponList,
    loadAddCoupon,
    addCoupon
}
