const mongoose = require('mongoose');

const {Schema} = mongoose;

const InterestWithdrawSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    amount:{
        type:Number,
    },
    percentage:{
        type:Number,
    },
    deposit_id:{
        type :Schema.Types.ObjectId,
        ref:'Payout',
    },
    bank_withdrawal_id:{
        type :Schema.Types.ObjectId,
        ref:'bank_payout',
    },
    reinvest_id:{
        type:Schema.Types.ObjectId,
        ref:'depositlog'
    },
    wallet_type:{
        type:String
    } ,
    crypto_withdrawal_id:{
        type:Schema.Types.ObjectId,
        ref:"Crypto_payout"
    } 
},{
    timestamps:true
});

module.exports = mongoose.model('interest_withdraw_log',InterestWithdrawSchema);