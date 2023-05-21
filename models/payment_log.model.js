const mongoose = require('mongoose');

const {Schema} = mongoose;

const PayentLogSchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    OrderId:{
        type:String,
        required:true
    },
    pay_id:{
        type:String,
    },
    amount:{
        type:Number,
        required:true
    },
    paymentMode:{
        type:String,
    },
    type:{
        type:String,
    },
    message:{
        type:String,
    },
    signature:{
        type:String,
    },
    status:{
        type:String,
    },
    time:{
        type:Date
    }
},
{
    timestamps:true,
})

module.exports = mongoose.model('paymentlog',PayentLogSchema);