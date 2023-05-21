const mongoose = require('mongoose');

const {Schema} = mongoose;

const InterestHistorySchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    deposit_id:{
        type:String,
    },
    transaction_id:{
        type:String,
    },
    staking_id:{
        type:String,
    },
    intrest_amount:{
        type:Number,
    },
    amount:{
        type:Number
    },
    interest_percentage:{
        type:Number
    },
    status:{
        type:Boolean
    },
    day:{
        type:String,
    },
    month:{
        type:String,
    },
    date:{
        type:String,
    },
    hours:{
        type:String,
    },
    minute:{
        type:String,
    },
    interest_type:{
        type:String
    },
    wallet_type:{
        type:String,
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('interest_history',InterestHistorySchema);