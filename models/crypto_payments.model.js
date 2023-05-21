const mongoose = require("mongoose");

const crypto_paymentSchema = new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    coins:{
        type:String,
    },
    email:{
        type:String,
    },
    phone_number:{
        type:Number,
    },
    created_at:{
        type:String,
    },
    network:{
        type:String,
    },
    wallet_address:{
        type:String,
    },
    remarks:{
        type:String,
    },
    withdrawal_amount:{
        type:Number,
    },
    confirmed_withdrawal:{
        type:Number,
    },
    fees:{
        type:Number
    },
    gas_fee:{
        type:Number
    },
    transaction_fee:{
        type:Number
    },
    bridging_fee:{
        type:Number
    },
    tds:{
        type:Number
    },
    status:{
        type:String,
    },
    withdrawal_type:{
        type:String
    },
    previous_transaction:{
        type:String
    },
    transaction_type:{
        type:String
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Crypto_payout',crypto_paymentSchema,'Crypto_payouts')