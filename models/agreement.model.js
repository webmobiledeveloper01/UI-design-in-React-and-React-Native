const mongoose = require('mongoose');

const {Schema} = mongoose

const agreementSchema = new Schema({
    staking_agreement:{
        type:String
    },
    risk_disclosure:{
        type:String
    },
    privacy_policy:{
        type:String
    },
    terms_of_use:{
        type:String
    },
    service_agreement:{
        type:String
    },
    liquidity_payment:{
        type:String
    },
    type:{
        type:String
    },
    total_percentage:{
        type:String,
    },
    total:{
        type:String,
    },
    week_percentage:{
        type:String,
    },
    week:{
        type:String,
    },
    total_supply:{
        type:String
    },
    circulating_supply:{
        type:String
    },
    holders:{
        type:String
    },
    zone_transfers:{
        type:String
    },
    market_cap:{
        type:String
    },
    fdv:{
        type:String
    },
    pair_createdAt:{
        type:String
    },
    company_webinar:{
        type:String,
    },
    ppt_plan:{
        type:String,
    }
},{
    timestamps:true
})

module.exports = mongoose.model("Agreement",agreementSchema);