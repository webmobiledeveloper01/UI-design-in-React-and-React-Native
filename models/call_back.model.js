const mongoose = require('mongoose');

const {Schema} = mongoose;

const CallBackSchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    phone_number:{
        type:Number,
    },
    message:{
        type:String
    }
},{
    timestamps:true,
});

module.exports = mongoose.model('callback',CallBackSchema);