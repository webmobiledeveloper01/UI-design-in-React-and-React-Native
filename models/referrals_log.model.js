const mongoose = require("mongoose")

const {Schema} = mongoose;

const referralLogSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    amount:{
        type:Number,
    },
    level:{
        type:String,
    },
    addedBy:{
        type :Schema.Types.ObjectId,
        ref:'user'
    },
},
{
    timestamps :true
})

module.exports = mongoose.model("referral_log",referralLogSchema);
