const mongoose = require('mongoose');

const {Schema} = mongoose;

const CurrencyTypeSchema = new Schema({
    currency_type:{
        type:String,
    },
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    country_name:{
        type:String,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('currencyType',CurrencyTypeSchema);