const mongoose = require('mongoose');

const {Schema} = mongoose

const bank_account_detailsSchema  = new Schema({
    bank_name:{
        type:String
    },
    account_number:{
        type:Number
    },
    IFSC_code:{
        type:String
    },
    bank_userName:{
        type:String
    },
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
},
{
    timestamps:true
});

module.exports = mongoose.model("bank_account_details",bank_account_detailsSchema);