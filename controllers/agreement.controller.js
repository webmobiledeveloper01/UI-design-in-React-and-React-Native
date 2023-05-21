const mongoose = require("mongoose")
const agreementModel = require("../models/agreement.model");
const axios = require("axios");
const both_plansModel = require("../models/both_plans.model");

module.exports = {
    async createUpdate (req,res,next) {
        try {
           const agreement = req.body;
           const agreementId = req.body.agreementId && mongoose.isValidObjectId(req.body.agreementId) ? req.body.agreementId : mongoose.Types.ObjectId();
           const agreementCreated = await agreementModel.findOneAndUpdate({_id:agreementId},agreement,{new:true,upsert:true});
           res.status(200).send({
                data:agreementCreated,
                error:null,
                message:"Created Agreement Successfully",
                status:1
            })
        } catch (error) {
            res.status(400).send({
                data:null,
                error: error,
                message: "Error occurs while creating agreement",
                status:0
            });
        }
    },


    async getdetails(req,res,next){
        try {
            const agreement = await agreementModel.findOne({type:"Agreements"});
            console.log(agreement,"agreement")
            res.status(200).send({
                data:{agreement:agreement},
                error:null,
                message:"Getting Agreement  details Successfully",
                status:1
            })
        } catch (error) {
            res.status(400).send({
                data:null,
                error: error,
                message: "Error occurs while getting agreement details",
                status:0
            });
        }
    },

    async tokenomics(req,res,next){
        try {
            const price = await axios.get(
                "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
              );
              console.log(price.data.pairs[0].priceUsd, "prices");
              const GGO_usd = price.data.pairs[0].priceUsd;
              const currency_value = 77.96;
              const GGO_inr = parseFloat(currency_value * GGO_usd);
              console.log(GGO_inr,"ifj")
              const agreement = await agreementModel.findOne({type:"tokenomics"});
              res.status(200).send({
                data:{GGO_inr:GGO_inr,
                    _id:agreement._id,
                    type:agreement.type,
                    total_percentage:agreement.total_percentage,
                    total:agreement.total,
                    week_percentage:agreement.week_percentage,
                    week:agreement.week,
                    token_distribution:{total_supply:agreement.total_supply,
                        circulating_supply:agreement.circulating_supply,
                        holders:agreement.holders,
                        zone_transfers:agreement.zone_transfers},
                    finanicial_dynamics:{market_cap:agreement.market_cap,
                        fdv:agreement.fdv,pair_createdAt:agreement.pair_createdAt},
                        createdAt:agreement.createdAt,updatedAt:agreement.updatedAt  
                    },
                error:null,
                message:"Getting tokenomics Successfully",
                status:1
            })
        } catch (error) {
            res.status(400).send({
                data:null,
                error: error,
                message: "Error in getting tokenomics",
                status:0
            });
        }
    },

    async reward_data(req,res,next){
        try{
            const get_data = await agreementModel.findOne({type:"rewards"}).lean();
            res.status(200).send({
                data:get_data,
                status:1,
                message:"get data"
            })
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in rewards data",
                status:0
            })
        }
      },
    
      async get_data_stake(req,res,next){
        try{
            const get_plans = await both_plansModel.findOne({amount:req.body.amount}).lean();
            const get_data = await agreementModel.findOne({type:"rewards"}).lean();
            const price = await axios.get(
                "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
              );
              console.log(price.data.pairs[0].priceUsd, "prices");
              const GGO_usd = price.data.pairs[0].priceUsd;
              const currency_value = 77.96;
              console.log(currency_value, "data");
              const GGO_inr = parseFloat(currency_value * GGO_usd);
              const today_bridge_rate_crypto = parseFloat(get_data.stake_reward)/parseFloat(GGO_inr);
              const get_crypto = parseFloat(req.body.amount)/parseFloat(GGO_inr);
              const percent = parseFloat(get_plans.stake_rewards)+ parseFloat(get_plans.stake_interest);
              const potential_asset = parseFloat(get_crypto)*(parseFloat(percent)/100)
            if(get_plans) {
                res.status(200).send({
                    data:{
                        your_credited : get_crypto,
                        credit_of_interest:get_plans.stake_monthly,
                        today_bridge_rate: get_data.stake_reward,
                        today_bridge_rate_crypto:today_bridge_rate_crypto,
                        potential_asset_value: potential_asset,
                        potential_asset_value_1 : get_plans.stake_rewards,
                        potential_asset_value_2 : get_plans.stake_interest,
                        bridge_rate:get_data.for
                    },
                    message:"stake data",
                    status:1
                })
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in data stake",
                status:0
            })
        }
      },
    
      async get_data_liquidity(req,res,next){
        try{
            const get_plans = await both_plansModel.findOne({amount:req.body.amount}).lean();
            const get_data = await agreementModel.findOne({type:"rewards"}).lean();
            const price = await axios.get(
                "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
              );
              console.log(price.data.pairs[0].priceUsd, "prices");
              const GGO_usd = price.data.pairs[0].priceUsd;
              const currency_value = 77.96;
              console.log(currency_value, "data");
              const GGO_inr = parseFloat(currency_value * GGO_usd);
              const today_bridge_rate_crypto = parseFloat(get_data.liquidity_reward)/parseFloat(GGO_inr);
              const get_crypto = parseFloat(req.body.amount)/parseFloat(GGO_inr);
              const liquidity_reward = 90.00
             
              const per = parseFloat(liquidity_reward)+parseFloat(get_plans.liquidity_interest)
              const potential_asset = parseFloat(get_crypto)*(parseFloat(per)/100)
            if(get_plans) {
                res.status(200).send({
                    data:{
                        your_credited : get_crypto,
                        credit_of_interest:get_plans.liquidity_monthly,
                        today_bridge_rate: get_data.liquidity_reward,
                        today_bridge_rate_crypto:today_bridge_rate_crypto,
                        potential_asset_value: potential_asset,
                        potential_asset_value_1 : liquidity_reward,
                        potential_asset_value_2 : get_plans.liquidity_interest,
                        bridge_rate:get_data.for
                    },
                    message:"liquidity data",
                    status:1
                })
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in get liquidity",
                status:0
            })
        }
      },

      async company_announcement(req,res,next){
        try{
            const get_data = await agreementModel.findOne({type:"company_announcement"}).lean();
            res.status(200).send({
                data:get_data,
                status:1,
                message:"get data"
            })
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"error in rewards data",
                status:0
            })
        }
      },


}