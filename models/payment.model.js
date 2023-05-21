const mongoose = require('mongoose');

const {Schema} = mongoose;

const PaymentSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    total_amount:{
        type:Number,
    },
    crypto:{
        type:Number,
    }
},{
    timestamps:true,
})

module.exports = mongoose.model('payment',PaymentSchema);