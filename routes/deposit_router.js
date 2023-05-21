const express = require('express');
const depositController = require('../controllers/deposit.controller');
const upload = require('../middleware/upload_deposit');
const router = express.Router()

router.post('/deposit_amount',depositController.deposit);

router.post('/payment_log',depositController.paymentLog);

router.post('/deposit_log',depositController.get_deposit_log);

router.post('/get/interest_details',depositController.get_interest_history);

router.post('/get/interest_log',depositController.get_interest_log);

router.post('/reinvest',depositController.deposit_reinvest);

router.post('/add_net_staking',depositController.add_net_staking);


// deposit details
router.post('/create_details',depositController.deposit_details);
router.get('/get_deposit_details',depositController.get_deposit_details);

//deposit data 
router.post('/create_deposit',upload.single('transaction_image'),depositController.updated_deposit);

router.post('/approvel_deposit',depositController.deposit_approvel);

router.post("/reject_deposit",depositController.deposit_rejected);

router.get('/deposit_get',depositController.get_deposit_data);
// router.post('/shedule_time',depositController.timer_deposit);

// router.get('/currency',depositController.get_currency)

router.post('/reinvest_data',depositController.get_reinvest_data)

module.exports = router