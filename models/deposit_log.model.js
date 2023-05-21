const mongoose = require('mongoose');

const {Schema} = mongoose;

const DepositLogSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    orderId:{
        type:String,
    },
    amount:{
        type:Number,
    },
    paymentCompleted:{
        type:Boolean,
    },
    currencyType:{
        type:String,
    },
    paymentType:{
        type:String,
    },
    status:{
        type:String,
    },
    crypto:{
        type:Number
    },
    holding_price:{
        type:String,
    },
    staking_id:{
        type:String,
    },
    previous_transaction:{
        type:String,
    },
    wallet_type:{
        type:String
    },
    percentage:{
        type:String
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('depositlog',DepositLogSchema);