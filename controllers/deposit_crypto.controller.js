const mongoose = require("mongoose");
const deposit_cryptoModel = require("../models/deposit_crypto.model");
const fs = require("fs");
const paymentModel = require("../models/payment.model");

exports.create_DepositCrypto = async(req,res) => {
    try {

        const get_balance = await paymentModel.findOne({userId:req.body.UserId}).lean();
        const schema = new deposit_cryptoModel(req.body)
        schema.status = 'pending'
        schema.interest_type = "monthly"
        schema.deposit_type= "crypto"
        schema.type = 'c'
        schema.previous_transaction = get_balance.total_amount
        if(req.file){
            schema.transaction_image = req.file.destination + req.file.filename
        }
        const create_depCrypto = await deposit_cryptoModel.create(schema)
        res.status(200).send({
            data:create_depCrypto,
            error:null,
            status:1,
            message:"Created deposit crypto Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in Creating deposit_crypto"
        })
    }
};