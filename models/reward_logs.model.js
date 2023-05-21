const mongoose = require("mongoose")

const {Schema} = mongoose;

const rewardLogSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    previous_rewards:{
        type:Number,
    },
    added_rewards:{
        type:Number,
    },
    gas_fee:{
        type:Number
    },
    transaction_fee:{
        type:Number
    },
    bridging_fee:{
        type:Number
    },
    tds:{
        type:Number
    },
    fees:{
        type:Number
    },
    final_amount:{
        type:Number
    },
    reward_type:{
        type:String
    },
    crypto:{
        type:Number
    }
},
{
    timestamps :true
})

module.exports = mongoose.model("rewards_log",rewardLogSchema);
