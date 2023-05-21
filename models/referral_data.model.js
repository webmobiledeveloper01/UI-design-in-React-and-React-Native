const mongoose = require('mongoose');

const {Schema} = mongoose;

const ReferralDataSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    l1:{
        type:Array,
    },
    l2:{
        type:Array,
    },
    l3:{
        type:Array,
    },
    l4:{
        type:Array,
    },
    l5:{
        type:Array,
    },
    l6:{
        type:Array,
    },
    l7:{
        type:Array,
    },
    l8:{
        type:Array,
    },
    l9:{
        type:Array,
    },
    l10:{
        type:Array,
    },
    l11:{
        type:Array,
    },
    l12:{
        type:Array,
    },
    l13:{
        type:Array,
    },
    l14:{
        type:Array,
    },
    l15:{
        type:Array,
    },
},{
    timestamps:true
})

module.exports = mongoose .model('referral_data',ReferralDataSchema);