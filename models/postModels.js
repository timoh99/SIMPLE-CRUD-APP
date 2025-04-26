const moongose=require('moongose')

const postschema=moongose.schema({
    title:{
        type:string,
        require:[true, 'title is required'],
        trim:true,
    },
       description:{
        type:string,
        required:[true, 'description is required'],
       },
       userid:{
        type:moongose.schema.Types.objectid,
        ref:'User',
        required:true,

       },
       },{
        timestamps:true,
    })

    module.exports=moongose.model('post', postschema)