const mongoose = require('mongoose');

const {Schema} = mongoose;

const stripeWithdrawalSchema = new Schema({
    UserId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    amount:{
        type:Number,
    },
    full_name:{
        type:String,
    },
    residential_address:{
        type:String,
    },
    bank_name:{
        type:String,
    },
    account_no:{
        type:String,
    },
    routing_no:{
        type:String,
    },
    swit_bic:{
        type:String
    }
})

module.exports = mongoose.model('stripe_withdrawal',stripeWithdrawalSchema);