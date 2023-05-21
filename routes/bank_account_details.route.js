const express = require('express');
const router = express.Router()

const bank_account_detController = require('../controllers/bank_account_details.controller');

router.post("/createUpdate",bank_account_detController.createUpdate);

router.get("/getUserId",bank_account_detController.getUserId);

router.post("/createUpdate_loginDetails",bank_account_detController.login_CreateUpdate);


module.exports = router;