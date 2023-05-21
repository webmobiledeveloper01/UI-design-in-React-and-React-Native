const mongoose  = require('mongoose');

const {Schema} = mongoose;

const NsrPlanSchema = new Schema({
    amount:{
        type:Number,
    },
    per_day:{
        type:Number,
    },
    per_hour:{
        type:Number,
    },
    per_min:{
        type:Number,
    },
    per_sec:{
        type:Number,
    }
})

module.exports = mongoose.model('nsr_plan',NsrPlanSchema);