const express = require('express');
const router = express.Router();

const P2P_withdrawController = require("../controllers/P2P_withdraw.controller");

router.post("/",P2P_withdrawController.P2P_withdrawal)

module.exports = router;