const stripe_withdrawalModel = require("../models/stripe_withdrawal.model");
const userModel = require("../models/user.model")
const interest_walletModel = require("../models/interest_wallet.model");
const referral_walletModel = require("../models/referral_wallet.model");
const net_staking_walletModel = require("../models/net_staking_wallet.model");
const stripe = require('stripe')('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')
module.exports={
    async create_payment(req,res,next){
        try{
            const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
            if(find_user){
                const schema ={
                amount:(req.body.amount)*100,
                currency:req.body.currency
                }
                
                const create_payment = await stripe.paymentIntents.create(schema)
                console.log(create_payment,"create_payment")
                res.status(200).send({
                    data:create_payment,
                    publish_key:"pk_live_51HgM4SI3xXOcZcJsIXesC40853Icphhq4k5JeTOhAVWj3XU0C7KCS7T3nRlIUFVCMAaUKy7QjGbLDAoHzj94GyXj00olv2Lwgl",
                    message:"Payment created",
                    status:1,
                    error:null
                })
            }
            else{
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
                message:"error in stripe payment create",
                status:0
            })
        }
    },

    async stripe_withdrawal(req,res,next){
        try{
            const find_user = await userModel.findOne({_id:req.body.UserId})
            if(find_user){
                console.log(find_user,"User");
                if(!find_user.first_deposit){

                    const find_interest_wallet = await interest_walletModel.findOne({
                        UserId: req.body.UserId,
                      });
                      const find_referral_earnings = await referral_walletModel.findOne({
                        userId: req.body.UserId,
                      });
                      const find_net_staking = await net_staking_walletModel.findOne({
                        UserId: req.body.UserId,
                      });
                      console.log(find_interest_wallet, "find_interest_wallet");
                      console.log(find_referral_earnings, "find_referral_earnings");
                      console.log(find_net_staking, "find_net_staking");
                      const total_withdrawal =
                        parseFloat(find_interest_wallet.total_amount) +
                        parseFloat(find_referral_earnings.total_amount) +
                        parseFloat(find_net_staking.total_amount);
                      console.log(total_withdrawal, "total_withdrawal");
                      const percentage = req.body.percentage;
              
                      const withdrawal_amount = (total_withdrawal * percentage) / 100;
                      const pay_amount = withdrawal_amount.toFixed(2)
            if(total_withdrawal>= pay_amount){
                // if(pay_amount>500){
                const schema = await stripe_withdrawalModel()
                schema.UserId = req.body.UserId;
                schema.amount = pay_amount;
                schema.full_name = req.body.full_name;
                schema.residential_address = req.body.residential_address; 
                schema.bank_name = req.body.bank_name;
                schema.account_no = req.body.account_no;
                schema.routing_no = req.body.routing_no;
                schema.swit_bic = req.body.swit_bic;

                const create_withdrawal = await stripe_withdrawalModel.create(schema)
                if(create_withdrawal){

                    const value_intrest =
                  find_interest_wallet.total_amount -
                  (find_interest_wallet.total_amount * percentage) / 100;
                const value_referral =
                  find_referral_earnings.total_amount -
                  (find_referral_earnings.total_amount * percentage) / 100;
                const value_staking =
                  find_net_staking.total_amount -
                  (find_net_staking.total_amount * percentage) / 100;
                console.log(value_intrest, "value_intrest");
                console.log(value_referral, "value_referral");
                console.log(value_staking, "value_staking");
                interest_walletModel
                  .findOneAndUpdate(
                    { UserId: req.body.UserId },
                    {
                      total_amount: value_intrest,
                    },
                    { new: true }
                  )
                  .then((update_interest) => console.log(update_interest));
                referral_walletModel
                  .findOneAndUpdate(
                    { userId: req.body.UserId },
                    {
                      total_amount: value_referral,
                    },
                    { new: true }
                  )
                  .then((update_referral_wallet) =>
                    console.log(update_referral_wallet)
                  );
                net_staking_walletModel
                  .findOneAndUpdate(
                    { UserId: req.body.UserId },
                    {
                      total_amount: value_staking,
                    },
                    { new: true }
                  )
                  .then((update_net_staking) =>
                    console.log(update_net_staking)
                  );

                    res.status(200).send({
                        data:create_withdrawal,
                        message:"stripe withdrawal created",
                        status:1,
                        error:null
                    })
                }
                else{
                    res.status(200).send({
                        data:create_withdrawal,
                        message:"withdrawal is not created",
                        status:0
                    })
                }
            // }
            // else{
            //     res.status(200).send({
            //         data:null,
            //         message:"minimum withdraw amount is 500",
            //         status:0
            //     })
            // }
            }else{
                res.status(200).send({
                    data:null,
                    message:"you con't have enough money in you wallet",
                    status:0
                })
            }
            }else{
                res.status(200).send({
                    data:null,
                    message:"You need to deposit first",
                    status:0
                })
            }
            }
            else{
                res.status(200).send({
                    data:null,
                    message:"No user found",
                    status:0
                })
            }
        }
        catch(error){
            res.status(400).send({
                errror:error,
                message:"Error in stripe withdrwal",
                status:0
            })
        }
    },

}