const mongoose = require('mongoose');
const { Schema } = mongoose;

const PayoutSchema = mongoose.Schema({
    payout_id:{
        type:String,
    },
    fund_account_id:{
        type:String,
    },
    contact_id:{
        type:String,
    },
    UserId:{
        type: Schema.Types.ObjectId, 
        ref: 'user'
    },
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    phone_number:{
        type:Number,
    },
    user_type:{
        type:String,
    },
    created_at:{
        type:String,
    },
    account_type:{
        type:String,
    },
    ifsc_code:{
        type:String,
    },
    bank_name:{
        type:String,
    },
    account_number:{
        type:String,
    },
    amount:{
        type:Number,
    },
    currency:{
        type:String,
    },
    status:{
        type:String,
    },
    purpose:{
        type:String,
    },
    merchant_id:{
        type:String,
    },
    status_details_id:{
        type:String,
    },
    mode:{
        type:String,
    },
    Idempotency:{
        type:String,
    },
    withdrawal_type:{
        type:String
    },
    previous_transaction:{
        type:String
    },
    transaction_type:{
        type:String
    },
    tax_amount:{
        type:Number
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Payout',PayoutSchema);