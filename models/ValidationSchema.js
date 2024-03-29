const joi = require('@hapi/joi');

const joiRegistrationSchema = joi.object({
    name : joi.string().required(),
    email : joi.string().email().lowercase().required(),
    mobile: joi.string().length(10).pattern(/^[0-9]+$/).required(),
    password : joi.string().min(2).max(4).pattern(/^[0-9]+$/).required().messages({
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

module.exports = {
    joiRegistrationSchema,
    joiProductSchema,
    joiUserSchema
}