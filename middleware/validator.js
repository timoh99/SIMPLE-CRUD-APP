const Joi =require('joi')
  

exports.signupschema=Joi.object({
    email:Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
        tlds:{allow:['com','net']},
    }),

    password:Joi.string()
    .required()
    .pattern(new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d$/))
});

exports.signinschema=Joi.object({
    email:Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
        tlds:{allow:['com','net']},
    }),

    password:Joi.string()
    .required()
    .pattern(new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d$/))
});


exports.acceptedCodeschema=Joi.object({
    email:Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
        tlds:{allow:['com','net']},
    }),
providedCode:Joi.number().required()



})

exports.changepasswordSchema =Joi.object({
    newpassword:Joi.string()
    .required()
    .pattern(new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d$/)),

    oldpassword:Joi.string()
    .required()
    .pattern(new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d$/))
})

exports.acceptFPCodeSchema = Joi.object({
    email:Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
        tlds:{allow:['com','net']},
    }),
    newpassword:Joi.string()
    .required()
    .pattern(new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d$/)),
    providedCode: Joi.string().required()
})