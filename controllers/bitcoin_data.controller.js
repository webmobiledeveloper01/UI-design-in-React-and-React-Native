const mongoose = require("mongoose")
const bitcoinModel = require("../models/bitcoin_data.model");
const fs = require("fs");

exports.createUpdate = async(req,res) => {
    try {
        console.log(req.files,"data")
    const bitcoin = req.body;
    if ((req.files).length>0) {
        for(let i=0;i<(req.files).length;i++){
        if(req.files[i].fieldname == "logo"){
            bitcoin.logo = req.files[i].destination+req.files[i].filename;
        }
        if(req.files[i].fieldname == "qr_code"){
            bitcoin.qr_code = req.files[i].destination+req.files[i].filename;
        }
    }
    }
    const bitcoinId = req.body.bitcoinId && mongoose.isValidObjectId(req.body.bitcoinId) ? req.body.bitcoinId : mongoose.Types.ObjectId();
    const bitcoinCreated = await bitcoinModel.findOneAndUpdate({_id:bitcoinId},bitcoin,{new:true,upsert:true});
    res.status(200).send({
        data:bitcoinCreated,
        error:null,
        message:"creating Bitcoin successfully",
        status:1
    })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            message:" error in creating Bitcoin",
            status:0
        })
    }
}

exports.getAll = async(req,res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;  
        const bitcoin = await bitcoinModel.find().skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const total = await bitcoinModel.countDocuments();
        res.status(200).send({
            data:{bitcoin:bitcoin,total:total, accept: "This QR Code can accept Tokens, Alt Coins, Stablecoins, and NFTs of Same Networks."},
            error:null,
            message:"Getting Bitcoin  successfully",
            status:1
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            message:" error in getting Bitcoin",
            status:0
        })
    }
}


exports.getById = async(req,res) => {
    try {
        const bitcoin = await bitcoinModel.findOne({_id:req.query.bitcoinId});
        res.status(200).send({
            data:{bitcoin:bitcoin},
            error:null,
            message:"Getting Bitcoin Id successfully",
            status:1
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            message:" error in getting Bitcoin Id",
            status:0
        })
    }
}

exports.delete = async(req,res)=>{
    try {
        const bitcoin = await bitcoinModel.findOneAndDelete({_id:req.query.bitcoinId});
      
            fs.unlink(bitcoin.logo, (err) => {
                if (err) throw err;
              });
              fs.unlink(bitcoin.qr_code, (err) => {
                if (err) throw err;
              });
            
        res.status(200).send({
            data:{bitcoin:bitcoin},
            error:null,
            message:"deleting Bitcoin Id successfully",
            status:1
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            message:" error in deleting Bitcoin Id",
            status:0
        })
    }
}