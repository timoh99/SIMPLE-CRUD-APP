const mongoose=require('mongoose');

const userschema =mongoose.Schema({
 email:{
    type:String,
    required:[true,'email is required!'],
    trim:true,
    unique:[true,'email must be unique'],
    minlength:[5,'email must have 5 characters'],
},

password:{
    type:String,
    required:[true,'password is required'],
    trim:true,
    select: false,
},
verified:{
    type:Boolean,
    default: false,
},
verificationcode:{
    type:String,
    select: false
},
forgotpasswordcode:{
    type:String,
    select: false,
    
},

forgotpasswordschema:{
    type:String,
    select:false,
},
},{
timestamps:true

});



module.exports =mongoose.model("user",userschema);