const mongoose = require('mongoose')

const {Schema} = mongoose;

const KycSchema = new Schema({
    UserId:{
        type: Schema.Types.ObjectId, 
        ref: 'user'
    },
    pan_image:{
        type:String,
    },
    selfie_image:{
        type:String
    },
    type:{
        type:String,
    },
    front_kyc:{
        type:String,
    },
    back_kyc:{
        type:String,
    },
    aadhar_image:{
        type:String,
    },
    aadhar_no:{
        type:String,
    },
    pan_no:{
        type:String,
    }
},{
    timestamps :true
})

module.exports = mongoose.model('kyc_data',KycSchema);