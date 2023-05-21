const kyc_imageModel = require("../models/kyc_image.model")
const userModel = require("../models/user.model")

module.exports={
    async get_all(req,res,next){
        try{
            const find_all = await kyc_imageModel.find()
            if(find_all.length<1){
                res.status(200).send({
                    data:null,
                    message:"no data found",
                    status:0
                })
            }
            else{
                res.status(200).send({
                    data:find_all,
                    message:"All data",
                    status:1,
                    error:null
                })
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in get all",
                status:0
            })
        }
    },

    async create(req,res,next){
        try{
            const find_user = await userModel.findOne({_id:req.body.UserId})
            if(find_user){
            console.log(req.files,"images")
            const schema = new kyc_imageModel()
            schema.UserId = req.body.UserId
            if(req.files.pan_image){
            schema.pan_image = req.files.pan_image[0].destination + req.files.pan_image[0].filename
            }
            if(req.files.selfie_image){
            schema.selfie_image = req.files.selfie_image[0].destination + req.files.selfie_image[0].filename
            }
            if(req.files.aadhar_image){
                schema.aadhar_image = req.files.aadhar_image[0].destination + req.files.aadhar_image[0].filename
            }
            
            schema.aadhar_no = req.body.aadhar_no
            schema.pan_no = req.body.pan_no
            schema.type = req.body.type
            const create_data = await kyc_imageModel.create(schema)
            const update_user = await userModel.findOneAndUpdate({_id:req.body.UserId},{kycVerified:"p"},{new:true}).lean();
            console.log(create_data,"data1123")
            res.status(200).send({
                data:create_data,
                message:"kyc data create",
                status:1,
                error:null
            })
        }else{
            res.status(200).send({
                data:null,
                message:"User not found",
                status:0
            })
        }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in create kyc data",
                status:0
            })
        }
    },

    async find_one(req,res,next){
        try{
            const get_data = await kyc_imageModel.findOne({type:"kyc"}).lean()
            if(get_data){
                res.status(200).send({
                    data:get_data,
                    message:"get kyc data",
                    status:1,
                    error:null
                })
            }else{
                res.status(200).send({
                    data:null,
                    message:"No data found",
                    status:0
                })
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in find one",
                status:0
            })
        }
    },

    async find_by_userId(req,res,next){
        try{
            const find_data = await kyc_imageModel.findOne({UserId:req.body.UserId})
            if(find_data){
                res.status(200).send({
                    data:find_data,
                    message:"kyc data",
                    status:1,
                    error:null
                })
            }
            else{
                res.status(200).send({
                    data:null,
                    message:"No data found",
                    status:0
                })
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"Error in kyc find by userId",
                status:0
            })
        }
    },

    async update_kyc(req,res){
        try {
            console.log(req.files,"req.body")
            const kyc = req.body;
            if((req.files).length>0){
                for(let i=0;i<(req.files).length;i++){
                    if(req.files[i].fieldname == "pan_image"){
                        kyc.pan_image = req.files[i].destination + req.files[i].filename
                    }
                    if(req.files[i].fieldname == "selfie_image"){
                        kyc.selfie_image = req.files[i].destination + req.files[i].filename
                    }
                    if(req.files[i].fieldname == "aadhar_image"){
                        kyc.aadhar_image = req.files[i].destination + req.files[i].filename
                    }   
                }
            }
            const update_kyc = await kyc_imageModel.findOneAndUpdate({UserId:req.body.userId},kyc,{new:true});
            res.status(200).send({
                data:update_kyc,
                error:null,
                status:1,
                message:"updating kyc"
            })
        } catch (error) {
            res.status(400).send({
                data:null,
                error:error,
                status:0,
                message:"error in update kyc"
            })
        }
    },
}