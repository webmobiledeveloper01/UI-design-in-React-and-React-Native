const mongoose = require('mongoose');

const {Schema} = mongoose

const WebhookSchema = new Schema({
    webhook:{
        type:Object
    },
},{
    timestamps:true,
});

module.exports = mongoose.model('webhook',WebhookSchema);