const express = require('express');
const router = express.Router();

const bitcoinController = require("../controllers/bitcoin_data.controller");
const uploads = require("../middleware/upload");

router.post("/createUpdate",uploads.any(),bitcoinController.createUpdate);

router.get("/getAll",bitcoinController.getAll);

router.get("/getById",bitcoinController.getById);

router.delete("/delete",bitcoinController.delete);

module.exports = router;