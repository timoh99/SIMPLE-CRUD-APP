const jwt= require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const { signupschema, acceptedCodeschema}= require ("../middleware/validator");
const { signinschema}= require ("../middleware/validator");
const transport=require("../middleware/sendMail");
const User=require("../models/userModels");
const { doHash, hmacprocess, doHashvalidation } = require("../utils/hashing"); 
const { changepasswordSchema } = require("../middleware/validator");
const { acceptFPCodeSchema } = require("../middleware/validator");



exports.signup= async (req,res )=>{
    const{email,password}=req.body;
    try{
    const {error,value}=signupschema.validate({email,password});
      if(error){
        return res.status(401).json ({success:false, message:error.details[0].message})
      }
      const existingUser =await User.findOne({email});
      if(existingUser){
        return res.status(401).json ({success:false, message: "user already exist"})
      }


      const hashedPassword= await doHash(password,12)
      const newUser=new User({
        email,
        password:hashedPassword

      })
        const results=await newUser.save(); 
        results.Password= undefined;
        res.status(201).json({
            success:true,message:'account created succesfully'
        })

    }catch(error ){
        console.log(error)

    }
};

exports.signin= async (req,res)=>{
    const {email,password}=req.body;
    try{
      const {error,value}=signinschema.validate({email,password});
      if(error){
        return res.status(401).json ({success:false, message:error.details[0].message})
      }
      const existingUser =await User.findOne({email}).select('+password')
      if(!existingUser){
        return res.status(401).json ({success:false, message: "user doesnot exist"})
      }

      const results =await bcrypt.compare(password,existingUser.password)
      if(!results){
        return res
        .status (401)
        .json({success:false ,message:"invalid logins"});
      }
        const token =jwt.sign(
            {
            Userid:existingUser._id,
            email:existingUser._email,
            verified:existingUser._verified,
        },
        process.env.TOKEN_SECRET,{
          expiresIn:"8h",
        }
    );
    res.cookie('Authorization','Bearer'+ token,{expires:new Date(Date.now()+3*36000),httpOnly:process.env.NODE_ENV==='production',
        secure:process.env.NODE_ENV==='production'})
        res.json({
            sucess:true,
            token,
            message:"logged in sucessfully"
        });

    }catch(error){
        console.log(error);
    }
};

exports.signout= async (req,res)=>{
  res.clearCookie('Authorization')
  .status(200)
  .json({success:true,message:'logged out succesfully'});
};

exports.sendverificationcode=async (req,res)=>{
  const {email}=req.body;
  try{
    const existingUser =await User.findOne({email})
    if(!existingUser){
      return res.status(404).json ({success:false, message: "user doesnot exist"})
    }
    if (existingUser.verified){
       return res
        return res.status(400).json ({success:false, message: "user  exist"})
      }

    const codeValue=Math.floor(Math.random()*10000).toString()
    let info= await transport.sendMail({ 
      from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to:existingUser.email,
      subject:"verification code",
      html: '<h1>' + codeValue + '</h1>'
    })
    if(info.accepted[0]===existingUser.email){
      const hashedcodeValue=hmacprocess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
      existingUser.verificationCode=hashedcodeValue;
      existingUser.verificationCodevalidation=Date.now();
      await existingUser.save()
      return res.status(200).json({sucess:true,message:'code sent!'});
    }
    return res.status(400).json({sucess:true,message:'code not sent!'});

  }catch(error){
    console.log (error);
  }
};

exports.VerifyverificationCode= async (req,res)=>{
  const {email, providedCode}= req.body;
  try{
    const {error, value} = acceptedCodeschema.validate({email,providedCode});
    if(error){
      return res
               .status(401)
               .json({success:false, message:error.details[0].message});

    }

  const codeValue = providedCode.toString();
  const existingUser =await User.findOne({email}).select("verificationCode + verificationCodeValidation");

  if(!existingUser){
    return res.status(401).json ({success:false, message: "user doesnot exist"})

  }
if(existingUser.verified){
  return res.status(400).json({sucess:false,message:"already verified"});
}

if (!existingUser.verificationCode || !existingUser.verificationCodevalidation) {
  return res.status(400).json({ success: false, message: "something is wrong with your code" });
}


 if(Date.now()-existingUser.verificationCodevalidation > 5*1000){
  return res
         .status(400)
         .json({success:false, message:"code expired"})
 }
 const hashedcodeValue=hmacprocess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
 if(hashedcodeValue===existingUser.verificationCode){
     existingUser.verified=true;
     existingUser.verificationCode=undefined;
     existingUser.verificationCodevalidation=undefined;
     await existingUser.save()
     return res
     .status(200)
     .json({success:true, message:"account verified"})

 } return res
          .status(400)
          .json({success:false,message:"unexpected occured!"});

  }catch (error){
    console.log(error);
  }
};

exports.changepassword =async (req, res)=>{
  const {Userid, verified}=req.user;
  const {oldpassword,newpassword}=req.body;
  console.log('Userid:', Userid);
  console.log('Verified:', verified);

  try {
    const {error,value}=changepasswordSchema.validate({oldpassword,newpassword});
    if(error){
      return res.status(401).json ({success:false, message:error.details[0].message})
    }
   
    const existingUser = await User.findOne({_id:Userid}).select('password');
    if(!existingUser){
      return res.status(401).json ({success:false, message: "user doesnot exist"});

  }
const result =await doHashvalidation(oldpassword, existingUser.password)
if(!existingUser){
  return res.status(401).json ({success:false, message: "invalid logins"});
}
const hashedPassword =await doHash(newpassword,12);
existingUser.password=hashedPassword;
await existingUser.save();
return res 
         .status(200)
         .json({success:true, message:'password updated'})
}catch (error) {
    console.log(error)
    
  }
};

exports.sendforgotpasswordcode=async (req,res)=>{
  const {email}=req.body;
  try{
    const existingUser =await User.findOne({email})
    if(!existingUser){
      return res.status(404).json ({success:false, message: "user doesnot exist"})
    }
    

    const codeValue=Math.floor(Math.random()*10000).toString()
    let info= await transport.sendMail({ 
      from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to:existingUser.email,
      subject:"forgotpassword code",
      html: '<h1>' + codeValue + '</h1>'
    })
    if(info.accepted[0]===existingUser.email){
      const hashedcodeValue=hmacprocess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
      existingUser.forgotpasswordCode=hashedcodeValue;
      existingUser.forgotpasswordCodevalidation=Date.now();
      await existingUser.save()
      return res.status(200).json({sucess:true,message:'code sent!'});
    }
    return res.status(400).json({sucess:true,message:'code not sent!'});

  }catch(error){
    console.log (error);
  }
};

exports.VerifyforgotpasswordCode= async (req,res)=>{
  const {email, providedCode,newpassword}= req.body;
  try{
    const {error, value} = acceptFPCodeSchema.validate({email,providedCode,newpassword});
    if(error){
      return res
               .status(401)
               .json({success:false, message:error.details[0].message});

    }

  const codeValue = providedCode.toString();
  const existingUser =await User.findOne({email}).select("forgotpasswordCode + forgotpasswordCodeValidation");

  if(!existingUser){
    return res.status(401).json ({success:false, message: "user doesnot exist"})

  }


if (!existingUser.forgotpasswordCode || !existingUser.forgotpasswordCodevalidation) {
  return res.status(400).json({ success: false, message: "something is wrong with your code" });
}


 if(Date.now()-existingUser.forgotpasswordCodevalidation > 5*1000){
  return res
         .status(400)
         .json({success:false, message:"code expired"})
 }
 const hashedcodeValue=hmacprocess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
 if(hashedcodeValue===existingUser.verificationCode){
  const hashedPassword= await doHash(newpassword,12)
  existingUser.password =hashedPassword
     existingUser.forgotpasswordCode=undefined;
     existingUser.forgotpasswordCodevalidation=undefined;
     await existingUser.save()
     return res
     .status(200)
     .json({success:true, message:"account verified"})

 } return res
          .status(400)
          .json({success:false,message:"unexpected occured!"});

  }catch (error){
    console.log(error);
  }
};


