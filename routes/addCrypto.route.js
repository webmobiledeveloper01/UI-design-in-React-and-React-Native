const express = require('express');
const router = express.Router();

const addCryptoControlller = require("../controllers/addCrypto.controller");
const uploads = require("../middleware/upload");

//addCrypto
router.post("/create_addCrypto",addCryptoControlller.create_addCrypto);
router.get("/get_addCrypto",addCryptoControlller.get_addCrypto);

//coins
router.post("/create_coin",addCryptoControlller.coins_create);
router.get("/getAll_coins",addCryptoControlller.getAll_coins);

//network
router.post("/create_network",uploads.single('qr_code'),addCryptoControlller.network_create);
router.get("/getAll_networks",addCryptoControlller.getAll_network);

module.exports = router;