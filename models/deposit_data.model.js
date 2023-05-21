const mongoose = require('mongoose');

const {Schema} = mongoose;

const DepositDataSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    transaction_image:{
        type:String,
    },
    transaction_id:{
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
    interest_type:{
        type:String,
    },
    crypto:{
        type:Number,
    },
    previous_transaction:{
        type:String,
    },
    wallet_type:{
        type:String
    },
    utr_id:{ 
        type:String,
    },
    user_utrId:{
        type:String
    }
},{
    timestamps:true
})

module.exports = mongoose.model('deposit_data',DepositDataSchema);