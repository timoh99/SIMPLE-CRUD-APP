const express=require('express')

const { identifier } = require('../middleware/identification');


const router =express.Router();

router.get('/all-posts', postController.signup);
router.get('/single-post', authController.signin);
router.post('/create-post',identifier,authController.signout);

router.put('/update-post',identifier,authController.sendverificationcode);
router.delete('/delete-post',identifier,authController.VerifyverificationCode);

module.exports=router