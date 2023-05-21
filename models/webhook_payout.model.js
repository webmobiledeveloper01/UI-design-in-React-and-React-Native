const mongoose = require('mongoose');

const {Schema} = mongoose

const WebhookPayoutSchema = new Schema({
    webhook:{
        type:Object
    },
},{
    timestamps:true,
});

module.exports = mongoose.model('webhook_payout',WebhookPayoutSchema);