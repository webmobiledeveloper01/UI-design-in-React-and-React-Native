const express = require('express');
const digioController = require('../controllers/digio.controller');


const router = express.Router()

router.post('/addsuccessid',digioController.addsuccessid);

router.post('/webhookdigio',digioController.webhookdigio);

router.post('/add_successid',digioController.add_successId);

router.post('/check_status',digioController.get_status);

module.exports = router;