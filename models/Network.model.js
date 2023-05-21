const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema({
    network:{
        type:String,
        required:true
    },
    key:{
        type:String
    },
    qr_code:{
        type:String
    }
},{
    timestamps:true
})

module.exports = mongoose.model("Network",networkSchema);