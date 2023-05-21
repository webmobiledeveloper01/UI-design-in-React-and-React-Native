const mongoose = require("mongoose");
const coinSchema = new mongoose.Schema({
    coinName:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

module.exports = mongoose.model("Coins",coinSchema);