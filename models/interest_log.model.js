const mongoose = require('mongoose');

const {Schema} = mongoose;

const InterestLogSchema = new Schema({
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
    status:{
        type:String
    },
    payment_completed:{
        type:Boolean,
    },
    intrest_type:{
        type:String,
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
    wallet_type:{
        type:String,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('interest_log',InterestLogSchema);