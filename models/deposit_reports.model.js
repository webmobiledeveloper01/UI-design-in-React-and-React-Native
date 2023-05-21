const mongoose = require('mongoose');

const {Schema} = mongoose;

const DepositReportsSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    month:{
        type:String,
    },
    ggoWallet:{
        type:Number,
    },
    reinvest_amount:{
        type:Number,
    },
    admin_deposit:{
        type:Number,
    },
    year:{
        type:String,
    },
    sharedRewards:{
        type:Number,
    },
    rewardsharecrypto:{
        type:Number,
    },
    referralId:{
        type:String,
    },
    referralBy:{
        type:String
    },
    
},{
    timestamps:true,
})

module.exports = mongoose.model('deposit_report',DepositReportsSchema);