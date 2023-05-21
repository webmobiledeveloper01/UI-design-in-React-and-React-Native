const mongoose = require('mongoose');

const {Schema} = mongoose

const BothPlansSchema = new Schema({
    amount:{
        type:String,
    },
    stake_rewards:{
        type:String,
    },
    stake_interest:{
        type:String,
    },
    stake_total:{
        type:String,
    },
    liquidity_rewards:{
        type:String,
    },
    liquidity_interest:{
        type:String,
    },
    liquidity_total:{
        type:String,
    }
},{
    timestamps:true
});

module.exports = mongoose.model('both_plans',BothPlansSchema);