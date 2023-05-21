const mongoose = require('mongoose');

const {Schema} = mongoose;

const impsBankAccountSchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    token:{
        type:String,
    },
    bankAccKey:{
        type:String,
    },
    merchantTrxnRefId:{
        type:String,
    },
    address:{
        type:String,
    },
    amount:{
        type:String,
    },
    bankAccNo:{
        type:String,
    },
    bankIfscCode:{
        type:String,
    },
    bankName:{
        type:String,
    },
    emailAddress:{
        type:String,
    },
    mobileNumber:{
        type:String,
    },
    otp1:{
        type:String,
    },
    otp2:{
        type:String,
    },
    merchantTrxnRefId:{
        type:String,
    },
    transferType:{
        type:String,
    },
    trxnNote:{
        type:String,
    },
    createdDate:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('impsBankAccount',impsBankAccountSchema);