const nsr_planModel = require("../models/nsr_plan.model")
const mongoose  = require('mongoose');

module.exports={
    async get_all(req,res,next){
        try{
            const find_all = await nsr_planModel.find().lean()
            if(find_all.length<1){
                res.status(200).send({
                    data:null,
                    message:"No plans available",
                    status:0
                })
            }
            else{
                res.status(200).send({
                    data:find_all,
                    message:"NSR plans",
                    status:1,
                    error:null
                })
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"Error in get all plans",
                status:0
            })
        }
    },
    
    async create_update(req,res,next){
        try{
            const schema = req.body

            const plan_Id = req.body.plan_id && mongoose.isValidObjectId(req.body.plan_id) ? req.body.plan_id : mongoose.Types.ObjectId();

            const create_update = await nsr_planModel.findOneAndUpdate({_id:plan_Id},schema,{new:true,upsert:true})

            res.status(200).send({
                data:create_update,
                message:"planse crated",
                status:1,
                error:null
            })
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"Error in create and update plans",
                status:0
            })
        }
    }
}