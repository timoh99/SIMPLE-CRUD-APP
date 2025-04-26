const {createHmac}= require('crypto')


const {hash}=require ("bcryptjs");


exports.doHash=(value , saltvalue)=>{
    const result =hash(value, saltvalue);
    return result;
};

exports.doHashvalidation=(value,hashedvalue)=>{
    const results=compare(value,hashedvalue)
    return results;
}

exports.hmacprocess=(value,key)=>{
    const results =createHmac('sha256',key).update(value).digest('hex')
    return results;
};