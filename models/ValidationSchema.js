const joi = require('@hapi/joi');
const { description } = require('@hapi/joi/lib/base');


const joiRegistrationSchema = joi.object({
    name : joi.string().required("name is required"),
    email : joi.string().email().lowercase().required("email is required"),
    mobile: joi.string().length(10).pattern(/^[0-9]+$/).required(),
    password : joi.string().length(6).pattern(/^[0-9]+$/).required(),
    confirmPassword:joi.string().valid(joi.ref('password')).required()
})

const joiProductSchema = joi.object({
    name : joi.string().required(),
    description : joi.string().max(500).required(),
    categories : joi.string().required(),
    price : joi.number().positive().required(),
    stock : joi.number().positive().required(),
    image: joi.array().items().max(4).required(),
    
})

const joiUserSchema = joi.object({
    name : joi.string().required(),
    email : joi.string().email().required(),
    mobile : joi.number().max(10).min(10). required()
})

const joiCategorySchema = joi.object({
  name:joi.string().required(),
  description:joi.string().required()
})

const joiCouponSchema = joi.object({
    name: joi.string(),
    ValidityDate: joi.date(),
    offerPrice: joi.number(),
    maximumLimit: joi.number().positive(),
    couponCode: joi.string()
    
})

const joiOfferSchema = joi.object({
    name:joi.string(),
    offerPrice:joi.number(),
    offerTypeName:joi.string(),
    offerType: joi.string(),
    ValidityDate:joi.date()
})

module.exports = {
    joiRegistrationSchema,
    joiProductSchema,
    joiUserSchema,
    joiCouponSchema,
    joiOfferSchema,
    joiCategorySchema
}