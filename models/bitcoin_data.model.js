const mongoose = require("mongoose");
const {Schema} = mongoose;

const bitcoinSchema = new Schema({
    name:{
        type:String,
    },
    price:{
        type:Number,
    },
    color:{
        type:String,
    },
    logo:{
        type:String,
    },
    qr_code:{
        type:String,
    },
    description:{
        type:String,
    }
},
{
    timestamps:true
})

module.exports = mongoose.model("bitcoin",bitcoinSchema);