const mongoose = require('mongoose');

const {Schema} = mongoose;

const DepositDetailsSchema = new Schema({
    Upi_id :{
        type:String,
    },
    type:{
        type:String,
    },
    account_number:{
        type:String,
    },
    ifsc_code:{
        type:String,
    },
    account_holder:{
        type:String,
    },
    account_type:{
        type:String,
    },
    bankName:{
        type:String
    }
    
})

module.exports = mongoose.model('deposit_details',DepositDetailsSchema);