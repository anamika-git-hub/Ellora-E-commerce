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
    }
});

module.exports=mongoose.model('User',userSchema);