const express = require('express');
const router = express.Router();

const deposit_cryptoController = require("../controllers/deposit_crypto.controller");
const uploadImage = require("../middleware/upload_deposit");

router.post("/create_DepositCrypto",uploadImage.single("transaction_image"),deposit_cryptoController.create_DepositCrypto);

module.exports = router;