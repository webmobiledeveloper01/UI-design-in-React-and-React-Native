const express = require('express');
const fidpayController = require('../controllers/fidyPay.controller');

const router = express.Router()

router.post('/bankInfoOtp', fidpayController.bankInfoRegistOtp);
router.post('/bankInfoRegister', fidpayController.bankInfoRegister);
router.post('/sendOtp', fidpayController.sendOtp);
router.post('/otpVerifycation', fidpayController.otpVerifycation);
router.post('/veifyIfsc', fidpayController.verifyIfscCode);  
router.post('/domesticPayment', fidpayController.domesticPayment);  
router.post('/webhook', fidpayController.webhook);  



module.exports = router;