const express=require('express')
const authController=require("../controllers/authController");
const { identifier } = require('../middleware/identification');


const router =express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout',identifier,authController.signout);

router.patch('/sendverificationcode',identifier,authController.sendverificationcode);
router.patch('/verifyverificationcode',identifier,authController.VerifyverificationCode);
router.patch('/sendforgotpasswordcode',authController.sendforgotpasswordcode);
router.patch('/changepassword',identifier,authController.changepassword);
router.patch('/verifyforgotpasswordcode',authController.VerifyforgotpasswordCode);
module.exports=router