const mongoose = require('mongoose');

const {Schema} = mongoose;

const WithdrawalLoagSchema = new Schema({
    UserId:{
        type:String,
    },
    amount:{
        type:Number,
    },
    type:{
        type:String,
    },
    description:{
        type:String,
    },
    status:{
        type:String,
    },
    transaction_id:{
        type:String,
    },
  createdDate:{ 
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('withdrawal_log',WithdrawalLoagSchema);