const mongoose = require("mongoose")

const {Schema} = mongoose;

const reviewSchema = new Schema({
    userId:{
        type :Schema.Types.ObjectId,
        ref:'user',
    },
    message:{
        type:String,
    }
},
{
    timestamps :true
})

module.exports = mongoose.model("review",reviewSchema);
