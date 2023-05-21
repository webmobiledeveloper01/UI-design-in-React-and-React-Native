const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({

    countryName:{
        type:String
    }
},{
    timestamps:true
})

module.exports = mongoose.model('country',countrySchema,'countries')