const mongoose = require('mongoose');

const {Schema} = mongoose;

const WeekChangeSchema = new Schema({
    date:{
        type:Date,
    },
    withdrawal_balance:{
        type:Number,
    },
    user_pr:{
        type:Number,
    },
    earn_pr:{
        type:Number,
    },
    des:{
        type:Number
    },
    get_type:{
        type:String,
    },
    withdraw_maintenance:{
        type:Boolean,
    },
    app_maintenance:{
        type:Boolean,
    },
    update_details:{
        type:Boolean,
    },
    withdraws_message:{
        type:String,
    }
})

module.exports = mongoose.model('week_change',WeekChangeSchema);