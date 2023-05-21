const mongoose = require("mongoose");

const bank_payoutSchema = new mongoose.Schema({

    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name_as_per_bank:{
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
    bank_name:{
        type:String,
    },
    account_number:{
        type:String,
    },
    ifsc_code:{
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
    },
    liquidity_interest:{
        type:String
    },
    stake_interest:{
        type:String
    }
},{
    timestamps:true
})

module.exports = mongoose.model('bank_payout',bank_payoutSchema,'bank_payouts')