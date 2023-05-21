const mongoose = require('mongoose');

const {Schema} = mongoose;

const StakeDepositWalletSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    total_amount:{
        type:Number,
    },
    crypto:{
        type:Number,
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('stake_deposit_wallet',StakeDepositWalletSchema);