const express = require('express');
const emailController = require("../controllers/email.controller");
const userController = require('../controllers/user.controller');
const nsr_planController = require('../controllers/nsr_plan.controller');
const kyc_imageController = require('../controllers/kyc_image.controller');
const upload = require('../middleware/upload');
const router = express.Router()

router.get('/get_user',userController.get_all);
router.post('/update_user',userController.update_user);
router.get('/find_one/:id',userController.findone);
router.delete('/delete/:id',userController.delete);
router.post('/login_user',userController.login_user);
router.post('/add_referral',userController.add_referral);
router.post('/get_details',userController.get_details);

router.post('/get_user_data',userController.getUserData);

router.post('/create_curreny',userController.create_currency);

router.post('/update_currency_type',userController.update_currency_type);

router.post('/get_referral/details',userController.referral_details);

router.post('/get_withdrawal_balance',userController.withdrawal_balance);

router.post('/get_referal_link',userController.referral_link);

router.post('/add_bonus',userController.add_bonus);

router.post('/get_net_staking',userController.get_net_staking);

router.get('/country_names',userController.get_country_names);

router.post('/create_data',upload.fields([{name:"pan_image"},{name:"selfie_image"},{name:"aadhar_image"}]),kyc_imageController.create);

router.post('/get_kyc_data',kyc_imageController.find_one);

router.post('/referral_tree',userController.referral_tree);
router.post('/referral_2_0',userController.referral_tree_2_0);
router.post('/referral_3_0',userController.referral_tree_3_0);

// create plans 
router.post('/plans/create_update',nsr_planController.create_update);
router.get('/plans/get_all',nsr_planController.get_all);

 // email
 router.post("/email_passcode", emailController.send_passcode);

// withdraw verify
router.get('/verify_withdraw/:id',userController.verify_withdraw);

// call back
router.post('/create_callback',userController.call_back);
router.post('/complete_callback',userController.complete_callback);
router.post("/update_callback",userController.update_callback);

//updates details
router.get('/get_updates',userController.get_update_details);
router.post('/create_updates_details',userController.updates_details);

//email verify 
router.post('/email_verify',emailController.verify_email);
//verify email code
router.post('/check_email',emailController.check_email_otp)

//mobile verify
router.post('/send_otp',userController.send_otp);
router.post('/verify_otp',userController.check_mobile_otp);

// update user
router.post('/update_data',userController.update_data)

//get liquidity data
router.post('/liquidity_data',userController.get_liquidity_data);

router.post('/stake_data',userController.get_stake_data);

//create country
router.post('/create_country',userController.createcountry);

//getall country
router.get('/get_country',userController.getcountry);

//create review
router.post('/create_review',userController.createreview);

//getall reviews
router.get('/get_reviews',userController.getreviews);

//user status
router.post('/user_status',userController.user_status);

//achivement
router.post('/achivement_data',userController.achivement_referral);

//kyc update 
router.post("/update_kyc",upload.any(),kyc_imageController.update_kyc);

router.post("/create_bankAccount",userController.add_BankAccount);

router.get("/get/addBackAccount",userController.get_addBankAccount);

router.get("/totalDownlineUsers/:userId",userController.total_users_v2);

router.get("/totalDownlineDeposits/:userId",userController.total_users_depostis);

router.get("/totalDownlineUsersDate/:userId/:type",userController.total_users_date);

router.get("/totalDownlineDepositsDate/:userId/:type",userController.total_users_depostis_date);


router.get("/downlineUsers/:userId",userController.total_users_all);

router.get("/overall/:userId",userController.over_all);

router.get("/levelUsers/:userId",userController.total_users_Level);

module.exports = router;