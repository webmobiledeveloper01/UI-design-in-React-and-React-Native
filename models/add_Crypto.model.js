const mongoose = require("mongoose");
const {Schema} = mongoose;

const addCryptoSchema = new Schema({
    coins:{
        type:String,
        required:true
    },
    network:{
        type:String,
        required:true
    },
    wallet_address:{
        type:String,
        required:true
    },
    remarks:{
        type:String,
        required:true
    },
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
},{
    timestamps:true
})

module.exports = mongoose.model("addCrypto",addCryptoSchema);