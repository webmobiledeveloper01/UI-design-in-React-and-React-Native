const mongoose = require('mongoose');

const {Schema} = mongoose;

const InterestWalletSchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    total_amount:{
        type:Number,
    },
},{
    timestamps:true,
})

module.exports = mongoose.model('interest_wallet',InterestWalletSchema);