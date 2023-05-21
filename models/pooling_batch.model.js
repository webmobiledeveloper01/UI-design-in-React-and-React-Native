const mongoose = require('mongoose');

const {Schema} = mongoose;

const PoolingBatchSchema = new Schema({
    batch_no:{
        type:Number,
    },
    no_of_users:{
        type:Number
    }
})

module.exports = mongoose.model('pooling_batch',PoolingBatchSchema);