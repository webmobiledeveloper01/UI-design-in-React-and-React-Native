const mongoose = require('mongoose');

const {Schema} = mongoose;

const DepositCryptoSchema = new Schema({
    UserId:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    transaction_image:{
        type:String,
    },
    amount:{
        type:Number,
    },
    status:{
        type:String,
    },
    deposit_type:{
        type:String
    },
    P2P_type:{
        type:String
    },
    previous_transaction:{
        type:String,
    },
    interest_type:{
        type:String
    },
    wallet_type:{
        type:String
    },
    transaction_hash:{
        type:String
    }
},{
    timestamps:true
})

module.exports = mongoose.model('deposit_crypto',DepositCryptoSchema);