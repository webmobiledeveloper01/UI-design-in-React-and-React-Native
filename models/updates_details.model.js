const mongoose = require('mongoose');

const {Schema} = mongoose;

const UpdatesDetailsSchema = new Schema({
    heading:{
        type:String,
    },
    description:{
        type:String,
    },
    date:{
        type:Date,
    },
},{
    timestamps:true,
});

module.exports = mongoose.model('updates_details',UpdatesDetailsSchema);