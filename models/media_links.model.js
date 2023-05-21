const mongoose = require("mongoose");
const media_linksSchema = new mongoose.Schema({
    name:{
        type:String
    },
    count:{
        type:Number
    },
    link:{
        type:String
    },
    text:{
        type:String
    },
},{
    timestamps:true
})

module.exports = mongoose.model("mediaLinks",media_linksSchema)