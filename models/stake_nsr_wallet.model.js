const  mongoose = require("mongoose");

const {Schema} = mongoose;

const StakeNsrWalletSchema = new Schema({
    UserId:{
        type: Schema.Types.ObjectId, 
        ref: 'user'
    },
    total_amount:{
        type:Number,
    },
},{
    timestamps:true
});

module.exports = mongoose.model('stake_nsr_wallet',StakeNsrWalletSchema);