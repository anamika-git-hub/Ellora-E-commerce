const { string, number } = require('joi');
const mongoose=require('mongoose');


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now
    },
    is_admin:{
        type:Number,
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    is_varified:{
        type:Boolean,
        default:false
    },
    addresses:[{
        name:{
            type:String
        },
        streetAddress:{
            type:String
        },
        city:{
            type:String
        },
        state:{
            type:String
        },
        country:{
            type:String
        },
        pincode:{
            type:Number
        },
        mobile:{
            type:Number
        },
        email:{
            type:String
        },
        landMark:{
            type:String
        }
    }]
});

module.exports=mongoose.model('User',userSchema);