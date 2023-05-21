const mongoose = require("mongoose");

const loginDetailSchema = new mongoose.Schema({
    UserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    loginTime: {
        type:Date
    }
},{
    timestamps: true
});
module.exports = mongoose.model("LoginDetails",loginDetailSchema);