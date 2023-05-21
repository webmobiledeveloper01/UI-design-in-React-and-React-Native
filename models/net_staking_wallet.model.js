const mongoose = require('mongoose');

const {Schema} = mongoose;

const NetStakingWalletSchema = new Schema({
    UserId:{
        type: Schema.Types.ObjectId, 
        ref: 'user'
    },
    total_amount:{
        type:Number,
    },
},{
    timestamps:true
});

module.exports= mongoose.model('netstaking_wallet',NetStakingWalletSchema);