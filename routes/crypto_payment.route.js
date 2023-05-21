const express = require('express');
const router = express.Router();

const crypto_paymentController = require("../controllers/crypto_payment.controller");

router.post("/",crypto_paymentController.cryto_payouts_withdrawal)

module.exports = router;