const mongoose = require("mongoose");
const {Schema} = mongoose;

const addBankAccountSchema = new Schema({
    bank_name:{
        type:String,
        required:true
    },
    name_as_per_bank:{
        type:String,
        required:true
    },
    account_number:{
        type:String,
        required:true
    },
    ifsc_code:{
        type:String,
        required:true
    },
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
},{
    timestamps:true
})

module.exports = mongoose.model("addBankAccount",addBankAccountSchema);