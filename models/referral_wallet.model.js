const mongoose = require('mongoose');

const {Schema} = mongoose;

const ReferralWalletSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    total_amount:{
        type:Number,
    },
},{
    timestamps:true
})

module.exports = mongoose .model('referralwallet',ReferralWalletSchema);