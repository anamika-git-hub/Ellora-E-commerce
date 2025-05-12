const { joiCouponSchema } = require('../models/ValidationSchema');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');


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
        const messages = req.flash('messages')[0] || {}; 
        const formData = req.flash('formData')[0] || {};

        res.render('addCoupon',{messages,formData})
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async(req,res)=>{
    try {
        const { error } = joiCouponSchema.validate(req.body,{password:2}, {
            abortEarly: false
          });
    if(error){ 
        const errorMessages = error.details.reduce((acc, cur) => {
            acc[cur.context.key] = cur.message;
            return acc;
        }, {});
        errorMessages['expiryDate'] = error.details.find(detail => detail.context.key === 'expiryDate' && detail.type === 'date.min')?.message;
         errorMessages['expiryDate_iso'] = error.details.find(detail => detail.context.key === 'expiryDate' && detail.type === 'date.iso')?.message;

        req.flash('messages', errorMessages);
        req.flash('formData', req.body);
        res.redirect('/admin/addCoupon')
    }
        const value = await joiCouponSchema.validateAsync(req.body)
        const {name,expiryDate,offerPrice,minimumLimit,couponCode} = value;
        const data = new Coupon({
            name:name,
            expiryDate:expiryDate,
            offerPrice:offerPrice,
            minimumLimit:minimumLimit,
            couponCode:couponCode
        });
        await data.save()
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async(req,res)=>{
   
  
    try {
        const {couponId} = req.query
        const data = await Coupon.findOne({_id:couponId});
        data.is_listed=!data.is_listed
        const d1 =  await data.save();
        console.log('dlkj',d1);
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCoupon = async(req,res)=>{
    try {
        const couponData = await Coupon.findById({_id:req.query.id});
        res.render('editCoupon',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

const editCoupon = async(req,res)=>{
    try {
        const {couponId} = req.query
        const couponData = await Coupon.findOneAndUpdate({_id:couponId},{$set:{name:req.body.name,expiryDate:req.body.expiryDate,offerPrice:req.body.offerPrice,minimumLimit:req.body.minimumLimit,couponCode:req.body.couponCode}})
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}

const applyCoupon = async(req,res)=>{
    try {
        const { couponCode }= req.body 
        const couponData = await Coupon.findOne({ couponCode });
        const cartData = await Cart.findOne({ userId: req.session.user_id });
        const usedUser = couponData.usedUsers.find(usedUser => usedUser.userId == req.session.user_id);
        if (usedUser && usedUser.status === true) {
            req.flash('error', 'This coupon has already been used');
            return res.redirect('/CheckOut');
        } else {
            const subTotal = cartData.products.reduce((total, products) => total + products.totalPrice, 0);
            const totalAfterDiscount = subTotal - couponData.offerPrice;
            req.flash('totalAfterDiscount', totalAfterDiscount);
            req.flash('discountAmount', couponData.offerPrice);
            req.flash('subTotal', subTotal);
            req.session.couponCode = couponCode;
            return res.redirect('/CheckOut');
        }
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'Internal Server Error');
        return res.redirect('/CheckOut');
    }
}

module.exports = {
    loadCouponList,
    loadAddCoupon,
    addCoupon,
    deleteCoupon,
    loadEditCoupon,
    editCoupon,
    applyCoupon,
}
