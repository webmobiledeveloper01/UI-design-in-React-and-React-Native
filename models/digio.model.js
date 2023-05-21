const mongoose = require('mongoose');

const {Schema} = mongoose;

const DigioSchema = new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    successId:{
        type:String,
    },
    status:{
        type:Number,
        default:0
    },
    createdDate:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('digio',DigioSchema);