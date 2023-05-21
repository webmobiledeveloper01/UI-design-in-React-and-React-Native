const mongoose = require('mongoose');

const {Schema} = mongoose;

const fidypayWebhookSchema = new Schema({
   
    description:{
        type:String,
    },
    merchantTrxnRefId:{
        type:String,
    },
    trxn_id:{
        type:String,
    },
    code:{
        type:String,
    },
    transactionIdentification:{
        type:String,
    },
    status:{
        type:String,
    },
    creationDateTime:{
        type:String,
    },
    instructionIdentification:{
        type:String,
    },
    amount:{
        type:String,
    },
    debitAccNo:{
        type:String,
    },
    beneficiaryAccNo:{
        type:String,
    },
    beneficiaryIfscCode:{
        type:String,
    },
    beneficiaryName:{
        type:String,
    },
    address:{
        type:String,
    },
    country:{
        type:String,
    },
    utr:{
        type:String,
    },
    createdDate:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('fidypay_webhook',fidypayWebhookSchema);