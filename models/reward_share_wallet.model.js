const mongoose = require('mongoose');

const {Schema} = mongoose;

const RewardShareWalletSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    total_amount:{
        type:Number,
    },
},{
    timestamps:true,
})

module.exports = mongoose.model('reward_share_wallet',RewardShareWalletSchema)