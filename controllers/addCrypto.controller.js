const mongoose = require("mongoose");
const addCryptoModel = require("../models/add_Crypto.model");
const coinsModel = require("../models/coins.model");
const networkModel = require("../models/Network.model")

exports.create_addCrypto = async(req,res)=>{
    try {
        const find_user = await addCryptoModel.find({UserId:req.body.UserId}).lean();
            if(find_user.length<12){
                const schema = new addCryptoModel(req.body)
                const addCrypto = await addCryptoModel.create(schema);
                res.status(200).send({
                    data:addCrypto,
                    error:null,
                    status:1,
                    message:"Created AddCrypto Successfully"
                })
            } else{
                res.status(200).send({
                    status:1,
                    message:"you already added 12 accounts"
                })
            }
    } catch (error) {
       res.status(400).send({
        data:null,
        error:error,
        status:0,
        message:"Error in creating the addCrypto"
       }) 
    }
};

exports.get_addCrypto = async(req,res)=>{
    try {
        const addCrypto = await addCryptoModel.find({UserId:req.query.UserId}).lean();
        if(addCrypto.length>0){
            res.status(200).send({
                data:addCrypto,
                error:null,
                status:1,
                message:"Getting the addCrypto data Successfully"
            })
        }else{
            res.status(200).send({
                data:[],
                status:0,
                message:"no data found"
            })
        }
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in getting the addCrypto"
        })
    }
};

exports.coins_create = async(req,res)=>{
    try {
        const coin = req.body;
        const coinId = req.body.coinId && mongoose.isValidObjectId(req.body.coinId) 
            ? req.body.coinId : mongoose.Types.ObjectId();
        const coinCreated = await coinsModel.findOneAndUpdate(
            {_id:coinId},coin,{new:true,upsert:true}
        ); 
        res.status(200).send({
            data:coinCreated,
            error:null,
            status:1,
            message:"Created coins successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:nulll,
            error:error,
            status:0,
            message:"Error in creating coins"
        })
    }
};

exports.getAll_coins = async(req,res)=>{
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const coins = await coinsModel.find().lean().skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const count = await coinsModel.countDocuments();
        res.status(200).send({
            data:{coins,count},
            error:null,
            status:1,
            message:"Getting coins Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in getting coins"
        })
    }
};

exports.network_create = async(req,res)=>{
    try {
        const network = req.body;
        if(req.file){
            network.qr_code = req.file.destination + req.file.filename
        }
        const networkId = req.body.networkId && mongoose.isValidObjectId(req.body.networkId) 
            ? req.body.networkId : mongoose.Types.ObjectId();
        const networkCreated = await networkModel.findOneAndUpdate(
            {_id:networkId},network,{new:true,upsert:true}
        ); 
        res.status(200).send({
            data:networkCreated,
            error:null,
            status:1,
            message:"Created network successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:nulll,
            error:error,
            status:0,
            message:"Error in creating network"
        })
    }
};

exports.getAll_network = async(req,res)=>{
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const network = await networkModel.find().lean().skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const count = await networkModel.countDocuments();
        res.status(200).send({
            data:{network,count},
            error:null,
            status:1,
            message:"Getting networks Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in getting networks"
        })
    }
};