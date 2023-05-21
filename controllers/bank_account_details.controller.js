const mongoose = require("mongoose")
const bank_acc_detailsModel = require("../models/bank_account_details.model");
const loginDetailsModel = require("../models/loginDetails.model");


module.exports = {

  async createUpdate(req,res,next){
        try {
            const bank_account = req.body;
            const bank_accountId = req.body.bank_accountId && mongoose.isValidObjectId(req.body.bank_accountId) ? req.body.bank_accountId : mongoose.Types.ObjectId();
            const bank_accountCreated = await bank_acc_detailsModel.findOneAndUpdate({_id:bank_accountId},bank_account,{new:true,upsert:true});
            res.status(200).send({
                data:bank_accountCreated,
                error:null,
                message:"Created bank account Successfully",
                status:1
            })
        } catch (error) {
            res.status(400).send({
                data:null,
                error: error,
                message: "Error occurs while creating bank account",
                status:0
            });
        }
    },

    async getUserId (req,res,next){
       try {
        const getUser = await bank_acc_detailsModel.findOne({UserId:req.query.UserId}).populate("UserId");
        console.log(getUser,"getUser")
        res.status(200).send({
                data:{getUser:getUser},
                error:null,
                message:"Getting userId Successfully",
                status:1
            })
       } catch (error) {
        res.status(400).send({
            data:null,
            error: error,
            message: "Error occurs while getting userId",
            status:0
        });
       }
    },

    async login_CreateUpdate(req,res,next) {
        try {
            const loginDetails = req.body;
            const loginDetailsId = req.body.loginDetailsId && mongoose.isValidObjectId(req.body.loginDetailsId) ? req.body.loginDetailsId : mongoose.Types.ObjectId();
            const update_loginDetails = await loginDetailsModel.findOneAndUpdate({UserId:req.body.UserId},{loginTime:Date.now(),UserId:req.body.UserId},{new:true,upsert:true})
            res.status(200).send({
                data:update_loginDetails,
                error:null,
                status:1,
                message:"Created loginDetails Succcessfully"
            })
        } catch (error) {
            res.status(400).send({
                data:null,
                error:error,
                message:"Error in creating loginDetails",
                status:0
            })
        }
    }
    
    
}