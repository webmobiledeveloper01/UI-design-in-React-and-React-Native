const mongoose = require('mongoose');

const {Schema} = mongoose;

const impsDataSchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    amount:{
        type:String,
    },
    address:{
        type:String,
    },
    code:{
        type:String,
    },
    mobileNumber:{
        type:String,
    },
    beneficiaryIfscCode:{
        type:String,
    },
    merchantTrxnRefId:{
        type:String,
    },
    trxn_id:{
        type:String,
    },
    utr:{
        type:String,
    },
    consentId:{
        type:String,
    },
    emailAddress:{
        type:String,
    },
    beneficiaryAccNo:{
        type:String,
    },
    trxnAuthDate:{
        type:String,
    },
    beneficiaryName:{
        type:String,
    },
    instructionIdentification:{
        type:String,
    },
    custId:{
        type:String,
    },
    bankAccountKey:{
        type:String,
    },
    transferType:{
        type:String,
    },
    transactionIdentification:{
        type:String,
    },
    status:{
        type:String,
    },
    createdDate:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('impsPayouts',impsDataSchema);