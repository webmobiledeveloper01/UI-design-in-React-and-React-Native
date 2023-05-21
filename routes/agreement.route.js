const express = require('express');
const router = express.Router();

const agreementController = require("../controllers/agreement.controller");

router.post("/createUpdate",agreementController.createUpdate);

router.get("/get",agreementController.getdetails);

router.get("/tokenomics",agreementController.tokenomics);

router.get('/rewards',agreementController.reward_data);

router.post('/get_stake_details',agreementController.get_data_stake);

router.post('/get_liquidity_details',agreementController.get_data_liquidity);

router.get('/get_company_announcement',agreementController.company_announcement);
module.exports = router;