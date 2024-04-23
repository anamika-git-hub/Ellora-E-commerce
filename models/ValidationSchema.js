const joi = require('@hapi/joi');

const joiRegistrationSchema = joi.object({
    name : joi.string().required("name is required"),
    email : joi.string().email().lowercase().required("email is required"),
    mobile: joi.string().length(10).pattern(/^[0-9]+$/).required(),
    password : joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
        'string.empty': `"password" cannot be an empty field`,
        'string.min': `"password" should have a minimum length of {#limit}`,
        'string.max': `"password" should have a maximum length of {#limit}`,
        'any.required': `"password" is a required field`,
        'string.pattern':`"password" must include`
      }),
    confirmPassword:joi.string().valid(joi.ref('password')).required()
})

const joiProductSchema = joi.object({
    name : joi.string().required(),
    description : joi.string().max(500).required(),
    categories : joi.string().required(),
    price : joi.number().positive().required(),
    stock : joi.number().positive().required(),
    image: joi.array().items(joi.string()).max(4).required(),
    
})

const joiUserSchema = joi.object({
    name : joi.string().required(),
    email : joi.string().email().required(),
    mobile : joi.number().max(10).min(10). required()
})

const joiCouponSchema = joi.object({
    name: joi.string(),
    ValidityDate: joi.date(),
    offerPrice: joi.number(),
    maximumLimit: joi.number().positive(),
    couponCode: joi.string()
    
})

module.exports = {
    joiRegistrationSchema,
    joiProductSchema,
    joiUserSchema,
    joiCouponSchema
}