const mongoose = require('mongoose');

const {Schema} = mongoose;

const PoolingSchema = new Schema({
    UserId:{
        type: Schema.Types.ObjectId, 
        ref: 'user'
    },
    row_number:{
        type:Number,
    },
    no_of_credits:{
        type:Number,
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    amount_credited:{
        type:Number,
    },
    batch_no:{
        type:Number
    },
    round:{
        type:Number,
    }
},{
    timestamps:true
})

module.exports  = mongoose.model('pooling',PoolingSchema);