 const jwt= require ('jsonwebtoken')

 exports.identifier =(req , res, next)=>{
  let token;
  if(req.headers.client==='not browser'){
    token = req.headers.authorization
  }else{
    token =req.cookies["Authorization"]
  }
if(!token){
    return res.status(403).json({success:false,message:'unauthorized'});
}
try {
    const Usertoken =token.split(' ')[1];
    const jwtverified=jwt.verify(Usertoken, process.env.TOKEN_SECRET);
    if(jwtverified){
        req.user= jwtverified;
        next()
    }else{
        throw new Error ('error in the token');
    }
} catch (error) {
   console.log(error) 
}
 }