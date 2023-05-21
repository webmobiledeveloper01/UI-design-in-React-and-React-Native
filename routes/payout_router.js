const express = require('express');
const razorpay_payoutController = require('../controllers/razorpay_payout.controller');
const stripe_paymentController = require('../controllers/stripe_payment.controller');

const router = express.Router()

router.post('/withdrawal_payment',razorpay_payoutController.payment_withdrawal);

// router.post('/withdrawal_referral',razorpay_payoutController.referral_withdrawal);

router.post('/get_payments',razorpay_payoutController.get_withdrawal_payment);

// webhoook
router.post('/webhook',razorpay_payoutController.payout_webhook);
router.post('/webhook_deposit',razorpay_payoutController.deposit_webhook);


// stripe
router.post('/create_payment',stripe_paymentController.create_payment);
router.post('/create_withdrawal',stripe_paymentController.stripe_withdrawal);

router.post('/approvel_payout',razorpay_payoutController.approval_payout);

router.post('/reject_payout',razorpay_payoutController.reject_payout);
router.post('/new_withdraws',razorpay_payoutController.new_withdraw);

router.post('/fees',razorpay_payoutController.fees);

router.post('/bank_withdrawal',razorpay_payoutController.bank_withdrawal);


module.exports = router
