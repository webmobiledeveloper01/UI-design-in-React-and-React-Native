const mongoose = require("mongoose")
const {Schema} = mongoose;
const storySchema = new Schema({
    image_url:{
        type:String,
    },
    direction:{
        type:String,
    }
},{ 
    timestamps:true
})

module.exports = mongoose.model('Story',storySchema);