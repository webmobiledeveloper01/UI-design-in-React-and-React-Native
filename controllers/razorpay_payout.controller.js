const axios = require("axios");
const interest_walletModel = require("../models/interest_wallet.model");
const userModel = require("../models/user.model");
const payoutModel = require('../models/payout.model');
const { v4: uuidv4 } = require('uuid');
const referral_walletModel = require("../models/referral_wallet.model");
const net_staking_walletModel = require("../models/net_staking_wallet.model");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const net_staking_withdrawal_logModel = require("../models/net_staking_withdrawal_log.model");
const interest_withdraw_logModel = require("../models/interest_withdraw_log.model");
const referral_withdraw_logModel = require("../models/referral_withdraw_log.model");
const otpGenerator = require("otp-generator");
const webhookModel = require("../models/webhook.model");
const webhook_payoutModel = require('../models/webhook_payout.model');
const deposit_logModel = require("../models/deposit_log.model");
const stake_interest_walletModel = require('../models/stake_interest_wallet.model');
const bank_payoutModel = require("../models/bank_payout.model");
const add_bankAccountModel = require("../models/add_bankAcount.model")
const weeek_changeModel = require('../models/week_change.model');

module.exports = {

  async payment_withdrawal(req, res, next) {
    var Idempotency = uuidv4();
    const random_number = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const timeStamp = new Date().getTime();
      const yesterdayTimeStamp = timeStamp - 24*60*60*1000;
      const yesterdayDate = new Date(yesterdayTimeStamp);
      const date_dataA = yesterdayDate.toISOString().slice(0,10)
      const datayw = 'T23:59:59.720Z'
      const data_m = date_dataA+datayw
      const Date_date = new Date(data_m) 
    try {
      const find_user = await userModel.findOne({ _id: req.body.UserId });
      if (find_user) {
        console.log(find_user,"user")
        if(find_user.current_withdraw){                    
        if(find_user.kycVerified == 'v'){
          if(!find_user.first_deposit){
            if(find_user.withdraw_verify){
              // if(req.body.transaction_type == 'liquidity'){
            const last_payouts = await payoutModel.find({UserId:req.body.UserId}).lean();
            var total_payout = 0
            for(let i=0;i<last_payouts.length;i++){
              total_payout = total_payout+last_payouts[i].amount
            }
            console.log(total_payout,"total_payout");
            if(total_payout <= 10000){
              var wallet_amount;
              if(req.body.wallet_type == 'interest_wallet'){
         wallet_amount = await interest_walletModel.findOne({
          UserId: req.body.UserId,
        });
      }else if(req.body.wallet_type == 'referral_wallet'){
        wallet_amount = await referral_walletModel.findOne({
          userId: req.body.UserId,
        });
      }else if(req.body.wallet_type == 'netstaking_wallet'){
        wallet_amount = await net_staking_walletModel.findOne({
          UserId: req.body.UserId,
        });
      }
          if (wallet_amount.total_amount >= req.body.amount) {
            const find_payout = await payoutModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date}}).sort({_id:-1})
            console.log(find_payout.length,"payout",find_payout)
            console.log(wallet_amount.total_amount ,"wallet")
            if(find_payout.length<1){
            if(req.body.amount >= 500){ // 1
              if(req.body.amount <= 3000){
            
                const schema = new payoutModel()
                schema.UserId = req.body.UserId
                schema.name = req.body.name 
                schema.email = "GGO@payment.com"
                schema.phone_number = req.body.mobileno
                schema.created_at = Date.now()
                schema.upi_id = req.body.upi_id
                schema.amount = req.body.amount
                schema.status = 'Inprocess'
                schema.withdrawal_type = req.body.wallet_type
                schema.previous_transaction = wallet_amount.total_amount
                schema.transaction_type = req.body.transaction_type
                payoutModel.create(schema).then(createPayout => {
                    console.log(createPayout,"dvhgfdvg")
                  console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")

                  userModel.findOneAndUpdate({_id:find_user._id},{
                    withdraw_verify:false,
                    passcode: random_number,
                      
                  },{new:true}).then(data121=>{console.log(data121)})

                if(req.body.wallet_type == 'netstaking_wallet'){
                  const schema_create = new net_staking_withdrawal_logModel()
                  schema_create.userId = req.body.UserId
                  schema_create.amount = req.body.amount;
                  schema_create.deposit_id = createPayout._id
                  schema_create.wallet_type = req.body.transaction_type
                  net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                }
                  if(req.body.wallet_type == 'interest_wallet'){
                  const schema_create1 = new interest_withdraw_logModel()
                  schema_create1.userId = req.body.UserId
                  schema_create1.amount = req.body.amount
                  schema_create1.deposit_id = createPayout._id
                  schema_create1.wallet_type = req.body.transaction_type
                  interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                  }
                  if(req.body.wallet_type == 'referral_wallet'){
                  const schema_create2 = new referral_withdraw_logModel()
                  schema_create2.userId = req.body.UserId
                  schema_create2.amount = req.body.amount
                  schema_create2.deposit_id = createPayout._id
                  schema_create2.wallet_type = req.body.transaction_type
                  referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                  }
                })
                
                if(req.body.wallet_type == 'interest_wallet'){
                console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)
              interest_walletModel.findOneAndUpdate({
                   UserId: req.body.UserId
                 },{
                  total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                 },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
               }else if(req.body.wallet_type == 'referral_wallet'){
                 referral_walletModel.findOneAndUpdate({
                   userId: req.body.UserId}
                   ,{
                    total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                   },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
               }else if(req.body.wallet_type == 'netstaking_wallet'){
                net_staking_walletModel.findOne({
                  UserId: req.body.UserId,
                }).then(data_amount=>{
                  const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
                  console.log(data_save,"datasave")
                  net_staking_walletModel.findOneAndUpdate({
                    UserId: req.body.UserId,
                  },{
                   total_amount : parseFloat(data_save)
                  },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                })
                 
               }
            res.status(200).send({
            
                message:"payment withdrawal successfully",
                status:1,
                error:null
            })
              
            }else{
              res.status(200).send({
                data:null,
                message:"maximum amount of withdraw is 3000",
                status:0
              })
            }
          
            }else{
              res.status(200).send({
                data:null,
                message:"Need to withdraw minimum 500",
                status:0
              })
            }
          }else{
            var amount = 0
            for(let i=0;i<find_payout.length;i++){
              amount = amount + find_payout[i].amount
            }
            if(amount >= 3000){
              res.send({
                message:"today withdraw limit is completed",
                status:0
              })
            }else{
              const data = 3000 - parseFloat(amount) 
              if(req.body.amount <= data){
                if(req.body.amount >= 500){ // 1
                  if(req.body.amount <= 3000){

                        const schema = new payoutModel()
                        schema.UserId = req.body.UserId
                        schema.name = req.body.name
                        schema.email = "GGO@payment.com"
                        schema.created_at = Date.now()
                        schema.phone_number = req.body.mobileno
                        schema.upi_id = req.body.upi_id
                        schema.amount = req.body.amount
                        schema.status = "Inprocess";
                        schema.withdrawal_type = req.body.wallet_type
                        schema.previous_transaction = wallet_amount.total_amount
                        schema.transaction_type = req.body.transaction_type
                        payoutModel.create(schema).then(createPayout => {
                  console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                          
                          userModel.findOneAndUpdate({_id:find_user._id},{
                            withdraw_verify:false,
                            passcode: random_number,
                            current_withdraw:false
                          },{new:true}).then(data121=>{console.log(data121)})
                        if(req.body.wallet_type == 'netstaking_wallet'){
                          const schema_create = new net_staking_withdrawal_logModel()
                          schema_create.userId = req.body.UserId
                          schema_create.amount = req.body.amount
                          schema_create.deposit_id = createPayout._id
                          schema_create.wallet_type = req.body.transaction_type
                          net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                        }
                          if(req.body.wallet_type == 'interest_wallet'){

                          const schema_create1 = new interest_withdraw_logModel()
                          schema_create1.userId = req.body.UserId
                          schema_create1.amount = req.body.amount
                          schema_create1.deposit_id = createPayout._id
                          schema_create1.wallet_type = req.body.transaction_type
                          interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                          }
                          if(req.body.wallet_type == 'referral_wallet'){
                          const schema_create2 = new referral_withdraw_logModel()
                          schema_create2.userId = req.body.UserId
                          schema_create2.amount = req.body.amount
                          schema_create2.deposit_id = createPayout._id
                          schema_create2.wallet_type = req.body.transaction_type
                          referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                          }
                        })
                        
                        if(req.body.wallet_type == 'interest_wallet'){
                console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)

                      interest_walletModel.findOneAndUpdate({
                           UserId: req.body.UserId
                         },{
                          total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                         },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                       }else if(req.body.wallet_type == 'referral_wallet'){
                         referral_walletModel.findOneAndUpdate({
                           userId: req.body.UserId}
                           ,{
                            total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                           },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                       }else if(req.body.wallet_type == 'netstaking_wallet'){
                        net_staking_walletModel.findOne({
                          UserId: req.body.UserId,
                        }).then(data_amount=>{
                          const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
                            console.log(data_save,"datasave")
                          net_staking_walletModel.findOneAndUpdate({
                            UserId: req.body.UserId,
                          },{
                           total_amount : parseFloat(data_save)
                          },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                        })
                       }
                    res.status(200).send({
        
                        message:"payment withdrawal successfully",
                        status:1,
                        error:null
                    })
                      
                }else{
                  res.status(200).send({
                    data:null,
                    message:"maximum amount of withdraw is 3000",
                    status:0
                  })
                }
                }else{
                  res.status(200).send({
                    data:null,
                    message:"Need to withdraw minimum 500",
                    status:0
                  })
                }
              }
              else{
                res.send({
                  message:`your withdraw limit is ${data}`
                })
              }
      
            }
          }
          } else {
            res.status(200).send({
              data: null,
              message: "you don't have enough money in your wallet",
              status: 0,
            });
          }
        
      }else{
        var wallet_amount;
              if(req.body.wallet_type == 'interest_wallet'){
         wallet_amount = await interest_walletModel.findOne({
          UserId: req.body.UserId,
        });
      }else if(req.body.wallet_type == 'referral_wallet'){
        wallet_amount = await referral_walletModel.findOne({
          userId: req.body.UserId,
        });
      }else if(req.body.wallet_type == 'netstaking_wallet'){
        wallet_amount = await net_staking_walletModel.findOne({
          UserId: req.body.UserId,
        });
      }
          if (wallet_amount.total_amount >= req.body.amount) {
            const find_payout = await payoutModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date}}).sort({_id:-1})
            console.log(find_payout.length,"payout")
            if(find_payout.length<1){
            if(req.body.amount >= 500){ // 1
              if(req.body.amount <= 3000){
                const payment = req.body.amount - (req.body.amount)*1/100
                const tax = (req.body.amount)*1/100
                const schema = new payoutModel()
                schema.UserId = req.body.UserId
                schema.name = req.body.name
                schema.email = "GGO@payment.com"
                schema.phone_number = req.body.mobileno
                schema.created_at = Date.now()
                schema.upi_id = req.body.upi_id
                schema.amount = payment
                schema.tax_amount = tax
                schema.status = 'Inprocess';
                schema.withdrawal_type = req.body.wallet_type
                schema.previous_transaction = wallet_amount.total_amount
                schema.transaction_type = req.body.transaction_type
                payoutModel.create(schema).then(createPayout => {
                  console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                  userModel.findOneAndUpdate({_id:find_user._id},{
                    withdraw_verify:false,
                    passcode: random_number,
                    current_withdraw:false
                  },{new:true}).then(data121=>{console.log(data121)})
                if(req.body.wallet_type == 'netstaking_wallet'){
                  const schema_create = new net_staking_withdrawal_logModel()
                  schema_create.userId = req.body.UserId
                  schema_create.amount = req.body.amount
                  schema_create.deposit_id = createPayout._id
                  schema_create.wallet_type = req.body.transaction_type
                  net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                }
                  if(req.body.wallet_type == 'interest_wallet'){
                  const schema_create1 = new interest_withdraw_logModel()
                  schema_create1.userId = req.body.UserId
                  schema_create1.amount = req.body.amount
                  schema_create1.deposit_id = createPayout._id
                  schema_create1.wallet_type = req.body.transaction_type
                  interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                  }
                  if(req.body.wallet_type == 'referral_wallet'){
                  const schema_create2 = new referral_withdraw_logModel()
                  schema_create2.userId = req.body.UserId
                  schema_create2.amount = req.body.amount
                  schema_create2.deposit_id = createPayout._id
                  schema_create2.wallet_type = req.body.transaction_type
                  referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                  }
                })
                
                if(req.body.wallet_type == 'interest_wallet'){
                console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)

              interest_walletModel.findOneAndUpdate({
                   UserId: req.body.UserId
                 },{
                  total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                 },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
               }else if(req.body.wallet_type == 'referral_wallet'){
                 referral_walletModel.findOneAndUpdate({
                   userId: req.body.UserId}
                   ,{
                    total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                   },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
               }else if(req.body.wallet_type == 'netstaking_wallet'){
                net_staking_walletModel.findOne({
                  UserId: req.body.UserId,
                }).then(data_amount=>{
                  const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
                  console.log(data_save,"datasave")
                  net_staking_walletModel.findOneAndUpdate({
                    UserId: req.body.UserId,
                  },{
                   total_amount : parseFloat(data_save)
                  },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                })
               }
            res.status(200).send({
                message:"payment withdrawal successfully",
                status:1,
                error:null
            })
              
            }else{
              res.status(200).send({
                data:null,
                message:"maximum amount of withdraw is 3000",
                status:0
              })
            }
          
            }else{
              res.status(200).send({
                data:null,
                message:"Need to withdraw minimum 500",
                status:0
              })
            }
          }else{
            var amount = 0
            for(let i=0;i<find_payout.length;i++){
              amount = amount + find_payout[i].amount
            }
            if(amount >= 3000){
              res.send({
                message:"today withdraw limit is completed",
                status:0
              })
            }else{
              const data = 3000 - parseFloat(amount) 
              if(req.body.amount <= data){
                if(req.body.amount >= 500){ // 1
                  if(req.body.amount <= 3000){
                    const payment = req.body.amount - (req.body.amount)*1/100
                    const tax = (req.body.amount)*1/100
                    
                        const schema = new payoutModel()
                        schema.UserId = req.body.UserId
                        schema.name = req.body.name
                        schema.email = "GGO@payment.com"
                        schema.phone_number = req.body.mobileno
                        schema.created_at = Date.now()
                        schema.upi_id = req.body.upi_id
                        schema.amount = payment
                        schema.tax_amount = tax
                        schema.status = 'Inprocess';
                        schema.withdrawal_type = req.body.wallet_type
                        schema.previous_transaction = wallet_amount.total_amount
                        schema.transaction_type = req.body.transaction_type
                        payoutModel.create(schema).then(createPayout => {
                  console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                          
                          userModel.findOneAndUpdate({_id:find_user._id},{
                            withdraw_verify:false,
                            passcode: random_number,
                            current_withdraw:false
                          },{new:true}).then(data121=>{console.log(data121)})
                        if(req.body.wallet_type == 'netstaking_wallet'){
                          const schema_create = new net_staking_withdrawal_logModel()
                          schema_create.userId = req.body.UserId
                          schema_create.amount = req.body.amount
                          schema_create.deposit_id = createPayout._id
                          schema_create.wallet_type = req.body.transaction_type
                          net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                        }
                          if(req.body.wallet_type == 'interest_wallet'){
                          const schema_create1 = new interest_withdraw_logModel()
                          schema_create1.userId = req.body.UserId
                          schema_create1.amount = req.body.amount
                          schema_create1.deposit_id = createPayout._id
                          schema_create1.wallet_type = req.body.transaction_type
                          interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                          }
                          if(req.body.wallet_type == 'referral_wallet'){
                          const schema_create2 = new referral_withdraw_logModel()
                          schema_create2.userId = req.body.UserId
                          schema_create2.amount = req.body.amount
                          schema_create2.deposit_id = createPayout._id
                          schema_create2.wallet_type = req.body.transaction_type
                          referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                          }
                        })
                        
                        if(req.body.wallet_type == 'interest_wallet'){
                console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)

                      interest_walletModel.findOneAndUpdate({
                           UserId: req.body.UserId
                         },{
                          total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                         },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                       }else if(req.body.wallet_type == 'referral_wallet'){
                         referral_walletModel.findOneAndUpdate({
                           userId: req.body.UserId}
                           ,{
                            total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
                           },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                       }else if(req.body.wallet_type == 'netstaking_wallet'){
                        net_staking_walletModel.findOne({
                          UserId: req.body.UserId,
                        }).then(data_amount=>{
                          const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
                          console.log(data_save,"datasave")
                          net_staking_walletModel.findOneAndUpdate({
                            UserId: req.body.UserId,
                          },{
                           total_amount : parseFloat(data_save)
                          },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                        })
                       }
                    res.status(200).send({
            
                        message:"payment withdrawal successfully",
                        status:1,
                        error:null
                    })
                      
                }else{
                  res.status(200).send({
                    data:null,
                    message:"maximum amount of withdraw is 3000",
                    status:0
                  })
                }
                }else{
                  res.status(200).send({
                    data:null,
                    message:"Need to withdraw minimum 500",
                    status:0
                  })
                }
              }
              else{
                res.send({
                  message:`your withdraw limit is ${data}`
                })
              }
      
            }
          }
          } else {
            res.status(200).send({
              data: null,
              message: "you don't have enough money in your wallet",
              status: 0,
            });
          }
      }
    // }
    // else
    // if(req.body.transaction_type == 'stake'){
    //   const last_payouts = await payoutModel.find({UserId:req.body.UserId}).lean();
    //         var total_payout = 0
    //         for(let i=0;i<last_payouts.length;i++){
    //           total_payout = total_payout+last_payouts[i].amount
    //         }
    //         console.log(total_payout,"total_payout");
    //         if(total_payout <= 10000){
    //           var wallet_amount;
    //           if(req.body.wallet_type == 'interest_wallet'){
    //      wallet_amount = await stake_interest_walletModel.findOne({
    //       UserId: req.body.UserId,
    //     });
    //   }else if(req.body.wallet_type == 'referral_wallet'){
    //     wallet_amount = await stake_referral_walletModel.findOne({
    //       userId: req.body.UserId,
    //     });
    //   }else if(req.body.wallet_type == 'netstaking_wallet'){
    //     wallet_amount = await stake_nsr_walletModel.findOne({
    //       UserId: req.body.UserId,
    //     });
    //   }
    //       if (wallet_amount.total_amount >= req.body.amount) {
    //         const find_payout = await payoutModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date}}).sort({_id:-1})
    //         console.log(find_payout.length,"payout",find_payout)
    //         console.log(wallet_amount.total_amount ,"wallet")
    //         if(find_payout.length<1){
    //         if(req.body.amount >= 500){ // 1
    //           if(req.body.amount <= 3000){
            
    //             const schema = new payoutModel()
    //             schema.UserId = req.body.UserId
    //             schema.name = req.body.name
    //             schema.email = "GGO@payment.com"
    //             schema.phone_number = req.body.mobileno
    //             schema.created_at = Date.now()
    //             schema.upi_id = req.body.upi_id
    //             schema.amount = req.body.amount
    //             schema.status = 'Inprocess'
    //             schema.withdrawal_type = req.body.wallet_type
    //             schema.previous_transaction = wallet_amount.total_amount
    //             schema.transaction_type = req.body.transaction_type
    //             payoutModel.create(schema).then(createPayout => {
    //                 console.log(createPayout,"dvhgfdvg")
    //               console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")

    //               userModel.findOneAndUpdate({_id:find_user._id},{
    //                 withdraw_verify:false,
    //                 passcode: random_number,
                      
    //               },{new:true}).then(data121=>{console.log(data121)})
    //             if(req.body.wallet_type == 'netstaking_wallet'){
    //               const schema_create = new net_staking_withdrawal_logModel()
    //               schema_create.userId = req.body.UserId
    //               schema_create.amount = req.body.amount;
    //               schema_create.deposit_id = createPayout._id
    //               schema_create.wallet_type = req.body.transaction_type
    //               net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
    //             }
    //               if(req.body.wallet_type == 'interest_wallet'){
    //               const schema_create1 = new interest_withdraw_logModel()
    //               schema_create1.userId = req.body.UserId
    //               schema_create1.amount = req.body.amount
    //               schema_create1.deposit_id = createPayout._id
    //               schema_create1.wallet_type = req.body.transaction_type
    //               interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
    //               }
    //               if(req.body.wallet_type == 'referral_wallet'){
    //               const schema_create2 = new referral_withdraw_logModel()
    //               schema_create2.userId = req.body.UserId
    //               schema_create2.amount = req.body.amount
    //               schema_create2.deposit_id = createPayout._id
    //               schema_create2.wallet_type = req.body.transaction_type
    //               referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
    //               }
    //             })
                
    //             if(req.body.wallet_type == 'interest_wallet'){
    //             console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)
    //           stake_interest_walletModel.findOneAndUpdate({
    //                UserId: req.body.UserId
    //              },{
    //               total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //              },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //            }else if(req.body.wallet_type == 'referral_wallet'){
    //              stake_referral_walletModel.findOneAndUpdate({
    //                userId: req.body.UserId}
    //                ,{
    //                 total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //                },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //            }else if(req.body.wallet_type == 'netstaking_wallet'){
    //             stake_nsr_walletModel.findOne({
    //               UserId: req.body.UserId,
    //             }).then(data_amount=>{
    //               const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
    //               console.log(data_save,"datasave")
    //               stake_nsr_walletModel.findOneAndUpdate({
    //                 UserId: req.body.UserId,
    //               },{
    //                total_amount : parseFloat(data_save)
    //               },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //             })
                 
    //            }
    //         res.status(200).send({
            
    //             message:"payment withdrawal successfully",
    //             status:1,
    //             error:null
    //         })
              
    //         }else{
    //           res.status(200).send({
    //             data:null,
    //             message:"maximum amount of withdraw is 3000",
    //             status:0
    //           })
    //         }
          
    //         }else{
    //           res.status(200).send({
    //             data:null,
    //             message:"Need to withdraw minimum 500",
    //             status:0
    //           })
    //         }
    //       }else{
    //         var amount = 0
    //         for(let i=0;i<find_payout.length;i++){
    //           amount = amount + find_payout[i].amount
    //         }
    //         if(amount >= 3000){
    //           res.send({
    //             message:"today withdraw limit is completed",
    //             status:0
    //           })
    //         }else{
    //           const data = 3000 - parseFloat(amount) 
    //           if(req.body.amount <= data){
    //             if(req.body.amount >= 500) { // 1
    //               if(req.body.amount <= 3000){

    //                     const schema = new payoutModel()
    //                     schema.UserId = req.body.UserId
    //                     schema.name = req.body.name
    //                     schema.email = "GGO@payment.com"
    //                     schema.created_at = Date.now()
    //                     schema.phone_number = req.body.mobileno
    //                     schema.upi_id = req.body.upi_id
    //                     schema.amount = req.body.amount
    //                     schema.status = "Inprocess";
    //                     schema.withdrawal_type = req.body.wallet_type
    //                     schema.previous_transaction = wallet_amount.total_amount
    //                     schema.transaction_type = req.body.transaction_type
    //                     payoutModel.create(schema).then(createPayout => {
    //               console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                          
    //                       userModel.findOneAndUpdate({_id:find_user._id},{
    //                         withdraw_verify:false,
    //                         passcode: random_number,
    //                         current_withdraw:false
    //                       },{new:true}).then(data121=>{console.log(data121)})
    //                     if(req.body.wallet_type == 'netstaking_wallet'){
    //                       const schema_create = new net_staking_withdrawal_logModel()
    //                       schema_create.userId = req.body.UserId
    //                       schema_create.amount = req.body.amount
    //                       schema_create.deposit_id = createPayout._id
    //                       schema_create.wallet_type = req.body.transaction_type
    //                       net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
    //                     }
    //                       if(req.body.wallet_type == 'interest_wallet'){

    //                       const schema_create1 = new interest_withdraw_logModel()
    //                       schema_create1.userId = req.body.UserId
    //                       schema_create1.amount = req.body.amount
    //                       schema_create1.deposit_id = createPayout._id
    //                       schema_create1.wallet_type = req.body.transaction_type
    //                       interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
    //                       }
    //                       if(req.body.wallet_type == 'referral_wallet'){
    //                       const schema_create2 = new referral_withdraw_logModel()
    //                       schema_create2.userId = req.body.UserId
    //                       schema_create2.amount = req.body.amount
    //                       schema_create2.deposit_id = createPayout._id
    //                       schema_create2.wallet_type = req.body.transaction_type
    //                       referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
    //                       }
    //                     })
                        
    //                     if(req.body.wallet_type == 'interest_wallet'){
    //             console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)

    //                   stake_interest_walletModel.findOneAndUpdate({
    //                        UserId: req.body.UserId
    //                      },{
    //                       total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //                      },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //                    }else if(req.body.wallet_type == 'referral_wallet'){
    //                      stake_referral_walletModel.findOneAndUpdate({
    //                        userId: req.body.UserId}
    //                        ,{
    //                         total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //                        },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //                    }else if(req.body.wallet_type == 'netstaking_wallet'){
    //                     stake_nsr_walletModel.findOne({
    //                       UserId: req.body.UserId,
    //                     }).then(data_amount=>{
    //                       const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
    //                         console.log(data_save,"datasave")
    //                       stake_nsr_walletModel.findOneAndUpdate({
    //                         UserId: req.body.UserId,
    //                       },{
    //                        total_amount : parseFloat(data_save)
    //                       },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //                     })
    //                    }
    //                 res.status(200).send({
        
    //                     message:"payment withdrawal successfully",
    //                     status:1,
    //                     error:null
    //                 })
                      
    //             }else{
    //               res.status(200).send({
    //                 data:null,
    //                 message:"maximum amount of withdraw is 3000",
    //                 status:0
    //               })
    //             }
    //             }else{
    //               res.status(200).send({
    //                 data:null,
    //                 message:"Need to withdraw minimum 500",
    //                 status:0
    //               })
    //             }
    //           }
    //           else{
    //             res.send({
    //               message:`your withdraw limit is ${data}`
    //             })
    //           }
      
    //         }
    //       }
    //       } else {
    //         res.status(200).send({
    //           data: null,
    //           message: "you don't have enough money in your wallet",
    //           status: 0,
    //         });
    //       }
        
    //   }else{
    //     var wallet_amount;
    //           if(req.body.wallet_type == 'interest_wallet'){
    //      wallet_amount = await stake_interest_walletModel.findOne({
    //       UserId: req.body.UserId,
    //     });
    //   }else if(req.body.wallet_type == 'referral_wallet'){
    //     wallet_amount = await stake_referral_walletModel.findOne({
    //       userId: req.body.UserId,
    //     });
    //   }else if(req.body.wallet_type == 'netstaking_wallet'){
    //     wallet_amount = await stake_nsr_walletModel.findOne({
    //       UserId: req.body.UserId,
    //     });
    //   }
    //       if (wallet_amount.total_amount >= req.body.amount) {
    //         const find_payout = await payoutModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date}}).sort({_id:-1})
    //         console.log(find_payout.length,"payout")
    //         if(find_payout.length<1){
    //         if(req.body.amount >= 500){ // 1 
    //           if(req.body.amount <= 3000){
    //             const payment = req.body.amount - (req.body.amount)*1/100
    //             const tax = (req.body.amount)*1/100
    //             const schema = new payoutModel()
    //             schema.UserId = req.body.UserId
    //             schema.name = req.body.name
    //             schema.email = "GGO@payment.com"
    //             schema.phone_number = req.body.mobileno
    //             schema.created_at = Date.now()
    //             schema.upi_id = req.body.upi_id
    //             schema.amount = payment
    //             schema.tax_amount = tax
    //             schema.status = 'Inprocess';
    //             schema.withdrawal_type = req.body.wallet_type
    //             schema.previous_transaction = wallet_amount.total_amount
    //             schema.transaction_type = req.body.transaction_type
    //             payoutModel.create(schema).then(createPayout => {
    //               console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
    //               userModel.findOneAndUpdate({_id:find_user._id},{
    //                 withdraw_verify:false,
    //                 passcode: random_number,
    //                 current_withdraw:false
    //               },{new:true}).then(data121=>{console.log(data121)})
    //             if(req.body.wallet_type == 'netstaking_wallet'){
    //               const schema_create = new net_staking_withdrawal_logModel()
    //               schema_create.userId = req.body.UserId
    //               schema_create.amount = req.body.amount
    //               schema_create.deposit_id = createPayout._id
    //               schema_create.wallet_type = req.body.transaction_type
    //               net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
    //             }
    //               if(req.body.wallet_type == 'interest_wallet'){
    //               const schema_create1 = new interest_withdraw_logModel()
    //               schema_create1.userId = req.body.UserId
    //               schema_create1.amount = req.body.amount
    //               schema_create1.deposit_id = createPayout._id
    //               schema_create1.wallet_type = req.body.transaction_type
    //               interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
    //               }
    //               if(req.body.wallet_type == 'referral_wallet'){
    //               const schema_create2 = new referral_withdraw_logModel()
    //               schema_create2.userId = req.body.UserId
    //               schema_create2.amount = req.body.amount
    //               schema_create2.deposit_id = createPayout._id
    //               schema_create2.wallet_type = req.body.transaction_type
    //               referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
    //               }
    //             })
                
    //             if(req.body.wallet_type == 'interest_wallet'){
    //             console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)

    //           stake_interest_walletModel.findOneAndUpdate({
    //                UserId: req.body.UserId
    //              },{
    //               total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //              },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //            }else if(req.body.wallet_type == 'referral_wallet'){
    //              stake_referral_walletModel.findOneAndUpdate({
    //                userId: req.body.UserId}
    //                ,{
    //                 total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //                },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //            }else if(req.body.wallet_type == 'netstaking_wallet'){
    //             stake_nsr_walletModel.findOne({
    //               UserId: req.body.UserId,
    //             }).then(data_amount=>{
    //               const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
    //               console.log(data_save,"datasave")
    //               stake_nsr_walletModel.findOneAndUpdate({
    //                 UserId: req.body.UserId,
    //               },{
    //                total_amount : parseFloat(data_save)
    //               },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //             })
    //            }
    //         res.status(200).send({
    //             message:"payment withdrawal successfully",
    //             status:1,
    //             error:null
    //         })
              
    //         }else{
    //           res.status(200).send({
    //             data:null,
    //             message:"maximum amount of withdraw is 3000",
    //             status:0
    //           })
    //         }
          
    //         }else{
    //           res.status(200).send({
    //             data:null,
    //             message:"Need to withdraw minimum 500",
    //             status:0
    //           })
    //         }
    //       }else{
    //         var amount = 0
    //         for(let i=0;i<find_payout.length;i++){
    //           amount = amount + find_payout[i].amount
    //         }
    //         if(amount >= 3000){
    //           res.send({
    //             message:"today withdraw limit is completed",
    //             status:0
    //           })
    //         }else{
    //           const data = 3000 - parseFloat(amount) 
    //           if(req.body.amount <= data){
    //             if(req.body.amount >= 500){ // 1
    //               if(req.body.amount <= 3000){
    //                 const payment = req.body.amount - (req.body.amount)*1/100
    //                 const tax = (req.body.amount)*1/100
                    
    //                     const schema = new payoutModel()
    //                     schema.UserId = req.body.UserId
    //                     schema.name = req.body.name
    //                     schema.email = "GGO@payment.com"
    //                     schema.phone_number = req.body.mobileno
    //                     schema.created_at = Date.now()
    //                     schema.upi_id = req.body.upi_id
    //                     schema.amount = payment
    //                     schema.tax_amount = tax
    //                     schema.status = 'Inprocess';
    //                     schema.withdrawal_type = req.body.wallet_type
    //                     schema.previous_transaction = wallet_amount.total_amount
    //                     schema.transaction_type = req.body.transaction_type
    //                     payoutModel.create(schema).then(createPayout => {
    //               console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                          
    //                       userModel.findOneAndUpdate({_id:find_user._id},{
    //                         withdraw_verify:false,
    //                         passcode: random_number,
    //                         current_withdraw:false
    //                       },{new:true}).then(data121=>{console.log(data121)})
    //                     if(req.body.wallet_type == 'x'){
    //                       const schema_create = new net_staking_withdrawal_logModel()
    //                       schema_create.userId = req.body.UserId
    //                       schema_create.amount = req.body.amount
    //                       schema_create.deposit_id = createPayout._id
    //                       schema_create.wallet_type = req.body.transaction_type
    //                       net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
    //                     }
    //                       if(req.body.wallet_type == 'interest_wallet'){
    //                       const schema_create1 = new interest_withdraw_logModel()
    //                       schema_create1.userId = req.body.UserId
    //                       schema_create1.amount = req.body.amount
    //                       schema_create1.deposit_id = createPayout._id
    //                       schema_create1.wallet_type = req.body.transaction_type
    //                       interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
    //                       }
    //                       if(req.body.wallet_type == 'referral_wallet'){
    //                       const schema_create2 = new referral_withdraw_logModel()
    //                       schema_create2.userId = req.body.UserId
    //                       schema_create2.amount = req.body.amount
    //                       schema_create2.deposit_id = createPayout._id
    //                       schema_create2.wallet_type = req.body.transaction_type
    //                       referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
    //                       }
    //                     })
                        
    //                     if(req.body.wallet_type == 'interest_wallet'){
    //             console.log(req.body.amount,"usbfsb",wallet_amount.total_amount)

    //                   stake_interest_walletModel.findOneAndUpdate({
    //                        UserId: req.body.UserId
    //                      },{
    //                       total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //                      },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //                    }else if(req.body.wallet_type == 'referral_wallet'){
    //                      stake_referral_walletModel.findOneAndUpdate({
    //                        userId: req.body.UserId}
    //                        ,{
    //                         total_amount : parseFloat(wallet_amount.total_amount) - req.body.amount
    //                        },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //                    }else if(req.body.wallet_type == 'netstaking_wallet'){
    //                     stake_nsr_walletModel.findOne({
    //                       UserId: req.body.UserId,
    //                     }).then(data_amount=>{
    //                       const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.amount)
    //                       console.log(data_save,"datasave")
    //                       stake_nsr_walletModel.findOneAndUpdate({
    //                         UserId: req.body.UserId,
    //                       },{
    //                        total_amount : parseFloat(data_save)
    //                       },{new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
    //                     })
    //                    }
    //                 res.status(200).send({
            
    //                     message:"payment withdrawal successfully",
    //                     status:1,
    //                     error:null
    //                 })
                      
    //             }else{
    //               res.status(200).send({
    //                 data:null,
    //                 message:"maximum amount of withdraw is 3000",
    //                 status:0
    //               })
    //             }
    //             }else{
    //               res.status(200).send({
    //                 data:null,
    //                 message:"Need to withdraw minimum 500",
    //                 status:0
    //               })
    //             }
    //           }
    //           else{
    //             res.send({
    //               message:`your withdraw limit is ${data}`
    //             })
    //           }
      
    //         }
    //       }
    //       } else {
    //         res.status(200).send({
    //           data: null,
    //           message: "you don't have enough money in your wallet",
    //           status: 0,
    //         });
    //       }
    //   }
    // }
      }
        else{
          res.status(200).send({
            data: null,
            message: "you're not verify withdraw",
            status: 0,
          });
        }
        }
        else{
          res.status(200).send({
            data:null,
            message:"Need to deposit",
            status:0
          })
        }
      
      }else{
        res.status(200).send({
          data: null,
          message: "verify your kyc",
          status: 0,
        });
      }
    }else{
      res.status(200).send({
        data: null,
        message: "You last withdraw is in Process.",
        status: 0,
      });
    }
      } else {
        res.status(200).send({
          data: null,
          message: "User not found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "Error in withdrawal payment",
        status: 0,
      });
    }
  },

  async approval_payout(req,res,next){
    try{
       const update_payout = await payoutModel.findOneAndUpdate({_id:req.body.payout_id},{
        status:"Success",
       },{new:true})
       if(update_payout){
        res.status(200).send({
          data:update_payout,
          message:"withdrawal approved",
          status:1,
          error:null
        })
       }else{
        res.status(200).send({
          data:update_payout,
          message:"withdrawal not approved",
          status:0
        })
       }
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"error in payout approved",
        status:0
      })
    }
  },

  async reject_payout(req,res,next){
    try{
       const update_payout = await payoutModel.findOneAndUpdate({_id:req.body.payout_id},{
        status:"Reversed",
       },{new:true})
       console.log(update_payout.withdrawal_type,"djfvgj")
      //  if(update_payout.transaction_type == "liquidity"){
       if(update_payout.tax_amount){
        if(update_payout.withdrawal_type == "interest_wallet"){
          interest_walletModel.findOne({
            UserId: update_payout.UserId,
          }).then(wallet =>{
            interest_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
              total_amount : parseFloat(wallet.total_amount) + parseFloat(update_payout.amount) + parseFloat(update_payout.tax_amount)
            },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
          });
         }else
         if(update_payout.withdrawal_type == "referral_wallet"){
          referral_walletModel.findOne({
            userId: update_payout.UserId,
          }).then(wallet =>{
            referral_walletModel.findOneAndUpdate({userId: update_payout.UserId},{
              total_amount : parseFloat(wallet.total_amount) + parseFloat(update_payout.amount) + parseFloat(update_payout.tax_amount)
            },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
          });
         }else
         if(update_payout.withdrawal_type == "netstaking_wallet"){
          net_staking_walletModel.findOne({
            UserId: update_payout.UserId,
          }).then(wallet =>{
            const data_save = parseFloat(wallet.total_amount)+ parseFloat(update_payout.amount) + parseFloat(update_payout.tax_amount)
            console.log(data_save,"datasave")
            net_staking_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
              total_amount : parseFloat(data_save)
            },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
          });
         }
       }
       else{
       if(update_payout.withdrawal_type == "interest_wallet"){
        interest_walletModel.findOne({
          UserId: update_payout.UserId,
        }).then(wallet =>{
          interest_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
            total_amount : parseFloat(wallet.total_amount) + update_payout.amount
          },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
        });
       }else
       if(update_payout.withdrawal_type == "referral_wallet"){
        referral_walletModel.findOne({
          userId: update_payout.UserId,
        }).then(wallet =>{
          referral_walletModel.findOneAndUpdate({userId: update_payout.UserId},{
            total_amount : parseFloat(wallet.total_amount) + update_payout.amount
          },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
        });
       }else
       if(update_payout.withdrawal_type == "netstaking_wallet"){
        net_staking_walletModel.findOne({
          UserId: update_payout.UserId,
        }).then(wallet =>{
          const data_save = parseFloat(wallet.total_amount)+ parseFloat(update_payout.amount) 
          console.log(data_save,"datasave")
          net_staking_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
            total_amount : parseFloat(data_save)
          },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
        });
       }
      }
    // }
    // else if(update_payout.transaction_type == "stake"){
    //   if(update_payout.tax_amount){
    //     if(update_payout.withdrawal_type == "interest_wallet"){
    //       stake_interest_walletModel.findOne({
    //         UserId: update_payout.UserId,
    //       }).then(wallet =>{
    //         stake_interest_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
    //           total_amount : parseFloat(wallet.total_amount) + parseFloat(update_payout.amount) + parseFloat(update_payout.tax_amount)
    //         },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
    //       });
    //      }else
    //      if(update_payout.withdrawal_type == "referral_wallet"){
    //       stake_referral_walletModel.findOne({
    //         userId: update_payout.UserId,
    //       }).then(wallet =>{
    //         stake_referral_walletModel.findOneAndUpdate({userId: update_payout.UserId},{
    //           total_amount : parseFloat(wallet.total_amount) + parseFloat(update_payout.amount) + parseFloat(update_payout.tax_amount)
    //         },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
    //       });
    //      }else
    //      if(update_payout.withdrawal_type == "netstaking_wallet"){
    //       stake_nsr_walletModel.findOne({
    //         UserId: update_payout.UserId,
    //       }).then(wallet =>{
    //         const data_save = parseFloat(wallet.total_amount)+ parseFloat(update_payout.amount) + parseFloat(update_payout.tax_amount)
    //         console.log(data_save,"datasave")
    //         stake_nsr_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
    //           total_amount : parseFloat(data_save)
    //         },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
    //       });
    //      }
    //    }
    //    else{
    //    if(update_payout.withdrawal_type == "interest_wallet"){
    //     stake_interest_walletModel.findOne({
    //       UserId: update_payout.UserId,
    //     }).then(wallet =>{
    //       stake_interest_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
    //         total_amount : parseFloat(wallet.total_amount) + update_payout.amount
    //       },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
    //     });
    //    }else
    //    if(update_payout.withdrawal_type == "referral_wallet"){
    //     stake_referral_walletModel.findOne({
    //       userId: update_payout.UserId,
    //     }).then(wallet =>{
    //       stake_referral_walletModel.findOneAndUpdate({userId: update_payout.UserId},{
    //         total_amount : parseFloat(wallet.total_amount) + update_payout.amount
    //       },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
    //     });
    //    }else
    //    if(update_payout.withdrawal_type == "netstaking_wallet"){
    //     stake_nsr_walletModel.findOne({
    //       UserId: update_payout.UserId,
    //     }).then(wallet =>{
    //       const data_save = parseFloat(wallet.total_amount)+ parseFloat(update_payout.amount) 
    //       console.log(data_save,"datasave")
    //       stake_nsr_walletModel.findOneAndUpdate({UserId: update_payout.UserId},{
    //         total_amount : parseFloat(data_save)
    //       },{new:true}).then(updated_wallet=>{console.log(updated_wallet)})
    //     });
    //    }
    //   }
    // }
       if(update_payout){
        res.status(200).send({
          data:update_payout,
          message:"withdrawal rejected",
          status:1,
          error:null
        })
       }else{
        res.status(200).send({
          data:update_payout,
          message:"withdrawal not rejected",
          status:0
        })
       }
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"error in payout reject",
        status:0
      })
    }
  },
  
  async get_withdrawal_payment(req,res,next){
    try{
      const find_payments = await payoutModel.find({UserId:req.body.UserId}).sort({_id:-1})
      const withdrawal = await interest_walletModel.findOne({UserId:req.body.UserId})
      const net_staking = await net_staking_walletModel.findOne({UserId:req.body.UserId})
      res.status(200).send({
        data:find_payments,
        withdrawal:withdrawal,
        net_taking:net_staking,
        message:"withdrawal payments",
        status:1,
        error:null
      })
    }
    
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in get withdrawal payment",
        
      })
    }
  },

  async deposit_webhook(req,res,next){
    try{
      const webhookBody = req.body

      const webhookSecret = 'dfC1JwJhkais46WuC30okbuU';

      const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', webhookSecret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log("deposit webhook created")
		// process it
		const schema = new webhookModel({
      webhook : req.body.payload
    })
    webhookModel.create(schema).then(result=>{
      console.log(result,"result")
      deposit_logModel.findOneAndUpdate({orderId:result.webhook.payload.payment.entity.order_id},{
        status:result.webhook.payload.payment.entity.status
      },{new:true}).then(deposit_update=>{console.log(deposit_update)})
    })
    res.status(200).send({
      message:"deposit webhook created",
      status:1
    })
	} else {
		// pass it
    console.log("webhook not created")
    res.status(200).send({
      message:"webhook not created",
      status:0
    })
	}
      
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in webhook deposit",
        status:0
      })
    }
  },

  async payout_webhook(req,res,next){
    try{
      const webhookBody = req.body

      const webhookSecret = 'dfC1JwJhkais46WuC30okbuU';

      const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', webhookSecret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log("payout webhook created")
		// process it
		const schema = new webhook_payoutModel({
      webhook : req.body.payload
    })
    webhook_payoutModel.create(schema).then(result=>{
      console.log(result,"result_payout")
      if(result.webhook.payout.entity.id){
        payoutModel.findOneAndUpdate({payout_id:result.webhook.payout.entity.id},{
          status:result.webhook.payout.entity.status
        },{new:true}).then(update_payout=>{
          console.log(update_payout,'update_payout')
          if(update_payout.status == 'reversed'){
          // net staking update
          if(update_payout.withdrawal_type == 'netstaking_wallet'){
          net_staking_withdrawal_logModel.findOne({deposit_id:update_payout._id}).then(update_netstaking=>{
            console.log(update_netstaking,'update_netstaking');
            net_staking_walletModel.findOne({UserId:update_netstaking.userId}).then(netstaking_wallet=>{
              net_staking_walletModel.findOneAndUpdate({UserId:netstaking_wallet.UserId},{
                total_amount:parseFloat(netstaking_wallet.total_amount) + parseFloat(update_netstaking.amount)
              },{new:true}).then(wallet_upadted=>{console.log(wallet_upadted,"wallet_updated")})
            })
          })
        }
          // referral update
          if(update_payout.withdrawal_type == 'referral_wallet'){
          referral_withdraw_logModel.findOne({deposit_id:update_payout._id}).then(update_referral=>{
            console.log(update_referral,"update_referral")
            referral_walletModel.findOne({userId:update_referral.userId}).then(referral_wallet=>{
              referral_walletModel.findOneAndUpdate({userId:referral_wallet.userId},{
                total_amount:parseFloat(referral_wallet.total_amount)+parseFloat(update_referral.amount)
              },{new:true}).then(ref_wallet_update=>{console.log(ref_wallet_update,"ref_wallet_update")})
            })
          })
        }
          // interest wallet 
          if(update_payout.withdrawal_type == 'interest_wallet'){
          interest_withdraw_logModel.findOne({deposit_id:update_payout._id}).then(update_interest=>{
            console.log(update_interest,"update_interest")
            interest_walletModel.findOne({UserId:update_interest.userId}).then(interest_wallet=>{
              interest_walletModel.findOneAndUpdate({UserId:interest_wallet.UserId},{
                total_amount:parseFloat(interest_wallet.total_amount)+parseFloat(update_interest.amount)
              },{new:true}).then(interest_wallet_update=>{console.log(interest_wallet_update,'interest_wallet_update')})
            })
          })
        }
        }
        })
      
      }
    
    })
    
    res.status(200).send({
      message:"payou webhook created",
      status:1
    })
	} else {
		// pass it
    console.log("webhook not created")
    res.status(200).send({
      message:"payout webhook not created",
      status:0
    })
	}
      
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in webhook payout",
        status:0
      })
    }
  },

  async new_withdraw(req,res,next){
    try {
      const find_user = await userModel.findOne({_id:req.body.UserId}).lean();
      if(find_user){
        const ref_wallet = await referral_walletModel.findOne({userId:find_user._id}).lean();
        const nsr_wallet = await net_staking_walletModel.findOne({UserId:find_user._id}).lean();
        const interest_wallet = await interest_walletModel.findOne({UserId:find_user._id}).lean();
        const stake_intrst_wallet = await stake_interest_walletModel.findOne({UserId:find_user._id}).lean();
        const price = await axios.get(
          "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
        );
        console.log(price.data.pairs[0].priceUsd, "prices");
        const GGO_usd = price.data.pairs[0].priceUsd;
        const currency_value = 77.96;
        console.log(currency_value, "data");
        const GGO_inr = parseFloat(currency_value * GGO_usd);
        const crypto_ref_wallet = parseFloat(ref_wallet.total_amount)/parseFloat(GGO_inr);
        const crypto_nsr_Wallet = parseFloat(nsr_wallet.total_amount)/parseFloat(GGO_inr);
        const total_interest = parseFloat(interest_wallet.total_amount)+parseFloat(stake_intrst_wallet.total_amount);
        const crypto_totalInterest = parseFloat(total_interest)/parseFloat(GGO_inr);
        const get_user = await add_bankAccountModel.find({UserId:find_user._id}).lean(); 
        const get_message = await weeek_changeModel.findOne({get_type:"withdraw"}).lean();
        const date_1 = new Date()
        const present_time = date_1.getHours()
        const message_popup = " You're Placing a Withdrawal after Banking Hours, this might stay in processing till 9 a.m. tomorrow. Do you still want to place it?"
        var message_show 
        var connected_banking
        if(present_time>= 18){
          message_show = true
        }else{
          message_show = false
        }
        if(10 <= present_time >= 18){
          connected_banking = true
        }else{
          connected_banking = false
        }
        res.status(200).send({
          data:{
            ref_wallet_balance : ref_wallet.total_amount,
            crypto_ref_wallet : crypto_ref_wallet,
            nsr_wallet_balance : nsr_wallet.total_amount,
            crypto_nsr_Wallet : crypto_nsr_Wallet,
            total_interest : total_interest,
            crypto_totalInterest : crypto_totalInterest,
            bankAccount_data :get_user,
            withdraws_message:get_message.withdraws_message,
            message_show:message_show,
            message_popup:message_popup,
            connected_banking:connected_banking
          },
          message:"getting new withdraws successfully",
          error:null,
          status:1
        })
      }
      else{
        res.status(200).send({
          error:null,
          message:"user not found",
          status:1
        })
      }
    } catch (error) {
      res.status(400).send({
        error:error,
        message:"error in new withdraws ",
        status:0
      })
    }
  },

  async fees (req,res,next){
    try {
      const amount = req.body.amount;
      var gas_fee;
      gas_fee= parseFloat((amount)*16.2/100);
      var trans_fee;
      trans_fee= parseFloat((amount)*3/100);
      var bridging_fee;
      bridging_fee = parseFloat((amount)*4/100);
      var tds;
      tds = parseFloat((amount)*1/100);
      var total;
      total = (gas_fee+trans_fee+bridging_fee+tds);
      var withdrawal;
      withdrawal = amount - total;
      const price = await axios.get(
        "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
      );
      console.log(price.data.pairs[0].priceUsd, "prices");
      const GGO_usd = price.data.pairs[0].priceUsd;
      const currency_value = 77.96;
      const GGO_inr = parseFloat(currency_value * GGO_usd);
      console.log(GGO_inr,"ifj")
      const gas_crypto = gas_fee / parseFloat(GGO_inr);
      const trans_fee_crypto = trans_fee / parseFloat(GGO_inr);
      const bridging_fee_crypto = bridging_fee / parseFloat(GGO_inr);
      const tds_crypto = tds / parseFloat(GGO_inr);
      const fees_crypto = total /  parseFloat(GGO_inr);
      const confirmed_withdrawal_crypto = withdrawal / parseFloat(GGO_inr);
      res.status(200).send({
        data:{withdrawal_amount:amount,
          withdrawal_crypto:amount,
          fees:total,
          fees_crypto:fees_crypto,
          gas_fee:gas_fee,
          gas_fee_crypto:gas_crypto,
          transaction_fee:trans_fee,
          trans_fee_crypto:trans_fee_crypto,
          bridging_fee:bridging_fee,
          bridging_fee_crypto:bridging_fee_crypto,
          tds:tds,
          tds_crypto:tds_crypto,
          confirmed_withdrawal:withdrawal,
          confirmed_withdrawal_crypto:confirmed_withdrawal_crypto,
          process_time:"12h 25m"},
        error:null,
        status:1,
        message:"fees"
      })
    } catch (error) {
      res.status(400).send({
        error:error,
        message:"error in fees ",
        status:0
      })
    }
  },

  async bank_withdrawal(req, res, next){
    var Idempotency = uuidv4();
    const random_number = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const timeStamp = new Date().getTime();
      const yesterdayTimeStamp = timeStamp - 24*60*60*1000;
      const yesterdayDate = new Date(yesterdayTimeStamp);
      const date_dataA = yesterdayDate.toISOString().slice(0,10)
      const datayw = 'T23:59:59.720Z'
      const data_m = date_dataA+datayw
      const Date_date = new Date(data_m) 
      const today_date = new Date()
    try {
       const find_user = await userModel.findOne({ _id: req.body.UserId });
      if(find_user){
        if(find_user.add_withdraw){
        if(find_user.current_withdraw){
          if(find_user.kycVerified =="v"){
            if(!find_user.first_deposit){ 
              // if(find_user.withdraw_verify){
                  var wallet_amount;
                  var wallet;
                  if(req.body.wallet_type=='interest_wallet'){
                    if(find_user.interest_wallet){
                    var interest_wallet = await interest_walletModel.findOne({UserId:req.body.UserId});
                    var staking_wallet= await stake_interest_walletModel.findOne({UserId: req.body.UserId});

                    wallet_amount=parseFloat(interest_wallet.total_amount)+parseFloat(staking_wallet.total_amount)
                    var per_wallet = parseFloat((req.body.withdrawal_amount*100)/wallet_amount )

                    var interest_amt = (parseFloat(interest_wallet.total_amount)*per_wallet)/100;
                    var staking_amt = (parseFloat(staking_wallet.total_amount)*per_wallet)/100;

                    var taken =parseFloat(interest_amt)+parseFloat(staking_amt)
                    console.log(interest_amt,"interest_amt",staking_amt,"staking_amt",per_wallet)
                    console.log(wallet_amount,"wallet_amount",taken)
                   console.log( parseFloat(interest_wallet.total_amount) -parseFloat(interest_amt))
                   console.log( parseFloat(staking_wallet.total_amount) -parseFloat(staking_amt))
                     } else{
                      return res.status(200).send({
                        data:null,
                        status:0,
                        message:"you are unable to withdraw from interest wallet"
                      })
                   }
                  }else if(req.body.wallet_type == 'referral_wallet'){
                    if(find_user.Addreferral){
                    wallet = await referral_walletModel.findOne({userId: req.body.UserId});
                    wallet_amount=wallet.total_amount;
                  } else{
                    return res.status(200).send({
                      data:null,
                      status:0,
                      message:"you are unable to withdraw from referral wallet"
                    })
                 }
                  }else if(req.body.wallet_type == 'netstaking_wallet'){
                    if(find_user.nsr_wallet){
                    wallet = await net_staking_walletModel.findOne({UserId: req.body.UserId});
                    wallet_amount=wallet.total_amount;
                  } else{
                    return res.status(200).send({
                      data:null,
                      status:0,
                      message:"you are unable to withdraw from nsr wallet"
                    })
                 }
                  }
                  if(wallet_amount >= req.body.withdrawal_amount){
                    const find_payout_tax = await bank_payoutModel.find({UserId:req.body.UserId,createdAt:{ $lte: today_date},status:"Success"}).sort({_id:-1})
                    console.log(find_payout_tax,"tax")
                    var total_payout = 0
                    for(let t=0;t<find_payout_tax.length;t++){
                      total_payout = parseFloat(total_payout) + parseFloat(find_payout_tax[t].withdrawal_amount)
                    }
                    console.log(total_payout,'total_payout',find_payout_tax.length)
                    if(total_payout>10000){
                      const one = (parseFloat(req.body.withdrawal_amount)*10)/100
                      const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one)
                      const find_payout = await bank_payoutModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date},status:"Success"}).sort({_id:-1})
                      if(find_payout.length<1){
                        if(req.body.withdrawal_amount >= 500){ ///1
                          if(req.body.withdrawal_amount <= 3000){ 
                            const one = parseFloat((req.body.withdrawal_amount)*10/100);
                            const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one);
                            const schema = new bank_payoutModel()
                            schema.UserId = req.body.UserId
                            schema.name_as_per_bank = req.body.name_as_per_bank
                            schema.email = "GGO@payment.com"
                            schema.phone_number = req.body.mobileno
                            schema.created_at = Date.now()
                            schema.bank_name = req.body.bank_name
                            schema.account_number = req.body.account_number
                            schema.ifsc_code = req.body.ifsc_code
                            schema.withdrawal_amount = finAmt
                            schema.fees = req.body.fees
                            schema.gas_fee = req.body.gas_fee
                            schema.transaction_fee = req.body.transaction_fee
                            schema.bridging_fee = req.body.bridging_fee
                            schema.tds = req.body.tds  
                            schema.confirmed_withdrawal = req.body.withdrawal_amount
                            schema.status = 'Inprocess'
                            schema.withdrawal_type = req.body.wallet_type
                            schema.previous_transaction = wallet_amount
                            schema.transaction_type = req.body.transaction_type
                            if(req.body.wallet_type == 'interest_wallet'){
                              schema.liquidity_interest = interest_amt
                              schema.stake_interest = staking_amt
                            }
                            bank_payoutModel.create(schema).then(createPayout=>{
                              console.log(createPayout,"dvhgfdvg")
                              // console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                              userModel.findOneAndUpdate({_id:find_user._id},{
                                withdraw_verify:false,
                                passcode: random_number,
                                current_withdraw:false
                              },{new:true}).then(data121=>{console.log(data121)})
  
                              if(req.body.wallet_type == 'netstaking_wallet'){
                                const schema_create = new net_staking_withdrawal_logModel()
                                schema_create.userId = req.body.UserId
                                schema_create.amount = req.body.withdrawal_amount;
                                schema_create.bank_withdrawal_id = createPayout._id
                                schema_create.wallet_type = req.body.transaction_type
                                net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111,"netstaking_wallet")})
                              }
                              if(req.body.wallet_type == 'interest_wallet'){
                                const schema_create1 = new interest_withdraw_logModel()
                                schema_create1.userId = req.body.UserId
                                schema_create1.amount = interest_amt
                                schema_create1.bank_withdrawal_id = createPayout._id
                                schema_create1.wallet_type = req.body.transaction_type
                                interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                                const schema_create = new interest_withdraw_logModel()
                                    schema_create.userId = req.body.UserId
                                    schema_create.amount = staking_amt
                                    schema_create.bank_withdrawal_id = createPayout._id
                                    schema_create.wallet_type = "stake"
                                    interest_withdraw_logModel.create(schema_create).then(data=>{console.log(data)})
                                }
                                if(req.body.wallet_type == 'referral_wallet'){
                                  const schema_create2 = new referral_withdraw_logModel()
                                  schema_create2.userId = req.body.UserId
                                  schema_create2.amount = req.body.withdrawal_amount
                                  schema_create2.bank_withdrawal_id = createPayout._id
                                  schema_create2.wallet_type = req.body.transaction_type
                                  referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                                  }
                            })
                            if(req.body.wallet_type == 'interest_wallet'){
                              interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                {total_amount : parseFloat(interest_wallet.total_amount) -parseFloat(interest_amt)},
                                {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
  
                                stake_interest_walletModel.findOne({UserId: req.body.UserId})
                              .then(data_amount=>{
                                console.log(data_amount,"data_amount1")
                                const data_save = parseFloat(data_amount.total_amount)-parseFloat(staking_amt)
                                console.log(data_save,"datasave1")
                                stake_interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                  {total_amount : parseFloat(data_save)},
                                  {new:true}).then(update_wallet1=>{console.log(update_wallet1,"update_wallet")});
                              })
                            }else if(req.body.wallet_type == 'referral_wallet'){
                              referral_walletModel.findOne({userId: req.body.UserId})
                                  .then(data_amount=>{
                                    const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                  console.log(data_save,"datasave")
                                  referral_walletModel.findOneAndUpdate({userId: req.body.UserId},
                                    {total_amount :parseFloat(data_save)},
                                    {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                                  })
                            }else if(req.body.wallet_type == 'netstaking_wallet'){
                              net_staking_walletModel.findOne({UserId: req.body.UserId})
                              .then(data_amount=>{
                                const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                console.log(data_save,"datasave")
                                net_staking_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                  {total_amount : parseFloat(data_save)},
                                  {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                              })
                             }
                          res.status(200).send({
                              message:"payment withdrawal successfully",
                              status:1,
                              error:null
                          })
                          }else{
                            res.status(200).send({
                              data:null,
                              message:"maximum amount of withdraw is 3000",
                              status:0
                            })
                          }
                        }else{
                          res.status(200).send({
                            data:null,
                            message:"Need to withdraw minimum 500",
                            status:0
                          })
                        }
                      }else{
                        var amount = 0
                        for(let i=0;i<find_payout.length;i++){
                          amount = amount + find_payout[i].withdrawal_amount
                        }
                        if(amount >= 3000){
                          res.send({
                            message:"today withdraw limit is completed",
                            status:0
                          })
                        }else{
                          const data = 3000 - parseFloat(amount)
                          if(req.body.withdrawal_amount <= data){
                            if(req.body.withdrawal_amount >= 500){ // 1
                              if(req.body.withdrawal_amount <= 3000){
                                const one = parseFloat((req.body.withdrawal_amount)*10/100);
                                const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one);
                                const schema = new bank_payoutModel()
                                schema.UserId = req.body.UserId
                                schema.name_as_per_bank = req.body.name_as_per_bank
                                schema.email = "GGO@payment.com"
                                schema.phone_number = req.body.mobileno
                                schema.created_at = Date.now()
                                schema.bank_name = req.body.bank_name
                                schema.account_number = req.body.account_number
                                schema.ifsc_code = req.body.ifsc_code
                                schema.withdrawal_amount = finAmt
                                schema.fees = req.body.fees
                                schema.gas_fee = req.body.gas_fee
                                schema.transaction_fee = req.body.transaction_fee
                                schema.bridging_fee = req.body.bridging_fee
                                schema.tds = req.body.tds  
                                schema.confirmed_withdrawal = req.body.withdrawal_amount
                                schema.status = 'Inprocess'
                                schema.withdrawal_type = req.body.wallet_type
                                schema.previous_transaction = wallet_amount
                                schema.transaction_type = req.body.transaction_type
                                if(req.body.wallet_type == 'interest_wallet'){
                                  schema.liquidity_interest = interest_amt
                                  schema.stake_interest = staking_amt
                                }
                                bank_payoutModel.create(schema).then(createPayout=>{
                                  console.log(createPayout,"dvhgfdvg")
                                  // console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                                  userModel.findOneAndUpdate({_id:find_user._id},{
                                    withdraw_verify:false,
                                    passcode: random_number,
                                    current_withdraw:false
                                  },{new:true}).then(data121=>{console.log(data121)})
                                  if(req.body.wallet_type == 'netstaking_wallet'){
                                    const schema_create = new net_staking_withdrawal_logModel()
                                    schema_create.userId = req.body.UserId
                                    schema_create.amount = req.body.withdrawal_amount;
                                    schema_create.bank_withdrawal_id = createPayout._id
                                    schema_create.wallet_type = req.body.transaction_type
                                    net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                                  }
                                  if(req.body.wallet_type == 'interest_wallet'){
                                    const schema_create = new interest_withdraw_logModel()
                                    schema_create.userId = req.body.UserId
                                    schema_create.amount = interest_amt
                                    schema_create.bank_withdrawal_id = createPayout._id
                                    schema_create.wallet_type = req.body.transaction_type
                                    interest_withdraw_logModel.create(schema_create).then(data222=>{console.log(data222)})
                                    const schema_create1 = new interest_withdraw_logModel()
                                    schema_create1.userId = req.body.UserId
                                    schema_create1.amount = staking_amt
                                    schema_create1.bank_withdrawal_id = createPayout._id
                                    schema_create1.wallet_type = "stake"
                                    interest_withdraw_logModel.create(schema_create1).then(data=>{console.log(data)})
                                    }
                                    if(req.body.wallet_type == 'referral_wallet'){
                                      const schema_create2 = new referral_withdraw_logModel()
                                      schema_create2.userId = req.body.UserId
                                      schema_create2.amount = req.body.withdrawal_amount
                                      schema_create2.bank_withdrawal_id = createPayout._id
                                      schema_create2.wallet_type = req.body.transaction_type
                                      referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                                      }
                                })
                                if(req.body.wallet_type == 'interest_wallet'){
                                  interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                    {total_amount : parseFloat(interest_wallet.total_amount) -parseFloat(interest_amt)},
                                    {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
  
                                    stake_interest_walletModel.findOne({UserId: req.body.UserId})
                                    .then(data_amount=>{
                                      console.log(data_amount,"data_amount1")
                                      const data_save = parseFloat(data_amount.total_amount)-parseFloat(staking_amt)
                                      console.log(data_save,"datasave2")
                                      stake_interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                        {total_amount : parseFloat(data_save)},
                                        {new:true}).then(update_wallet1=>{console.log(update_wallet1,"update_wallet")});
                                    })
                                }else if(req.body.wallet_type == 'referral_wallet'){
                                  referral_walletModel.findOne({userId: req.body.UserId})
                                  .then(data_amount=>{
                                    const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                  console.log(data_save,"datasave")
                                  referral_walletModel.findOneAndUpdate({userId: req.body.UserId},
                                    {total_amount :parseFloat(data_save)},
                                    {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                                  })
                                }else if(req.body.wallet_type == 'netstaking_wallet'){
                                  net_staking_walletModel.findOne({UserId: req.body.UserId})
                                  .then(data_amount=>{
                                    const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                    console.log(data_save,"datasave")
                                    net_staking_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                      {total_amount : parseFloat(data_save)},
                                      {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                                  })
                                 }
                                 res.status(200).send({
                                  message:"payment withdrawal successfully",
                                  status:1,
                                  error:null
                              })
                              }else{
                                res.status(200).send({
                                  data:null,
                                  message:"maximum amount of withdraw is 3000",
                                  status:0
                                })
                              }
                            }else{
                              res.status(200).send({
                                data:null,
                                message:"Need to withdraw minimum 500",
                                status:0
                              })
                            }
                          }else{
                            res.send({
                              message:`your withdraw limit is ${data}`
                            })
                          }
                        }
                      }

                    }
                    else{
                      const find_payout = await bank_payoutModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date},status:"Success"}).sort({_id:-1})
                    if(find_payout.length<1){
                      if(req.body.withdrawal_amount >= 500){ // 1
                        if(req.body.withdrawal_amount <= 3000){ 
                          const one = parseFloat((req.body.withdrawal_amount)*10/100);
                          const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one);
                          const schema = new bank_payoutModel()
                          schema.UserId = req.body.UserId
                          schema.name_as_per_bank = req.body.name_as_per_bank
                          schema.email = "GGO@payment.com"
                          schema.phone_number = req.body.mobileno
                          schema.created_at = Date.now()
                          schema.bank_name = req.body.bank_name
                          schema.account_number = req.body.account_number
                          schema.ifsc_code = req.body.ifsc_code
                          schema.withdrawal_amount = req.body.withdrawal_amount
                          schema.fees = req.body.fees
                          schema.gas_fee = req.body.gas_fee
                          schema.transaction_fee = req.body.transaction_fee
                          schema.bridging_fee = req.body.bridging_fee
                          schema.tds = req.body.tds  
                          schema.confirmed_withdrawal = req.body.withdrawal_amount
                          schema.status = 'Inprocess'
                          schema.withdrawal_type = req.body.wallet_type
                          schema.previous_transaction = wallet_amount
                          schema.transaction_type = req.body.transaction_type
                          if(req.body.wallet_type == 'interest_wallet'){
                            schema.liquidity_interest = interest_amt
                            schema.stake_interest = staking_amt
                          }
                          bank_payoutModel.create(schema).then(createPayout=>{
                            console.log(createPayout,"dvhgfdvg")
                            // console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                            userModel.findOneAndUpdate({_id:find_user._id},{
                              withdraw_verify:false,
                              passcode: random_number,
                              current_withdraw:false
                            },{new:true}).then(data121=>{console.log(data121)})

                            if(req.body.wallet_type == 'netstaking_wallet'){
                              const schema_create = new net_staking_withdrawal_logModel()
                              schema_create.userId = req.body.UserId
                              schema_create.amount = req.body.withdrawal_amount;
                              schema_create.bank_withdrawal_id = createPayout._id
                              schema_create.wallet_type = req.body.transaction_type
                              net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111,"netstaking_wallet")})
                            }
                            if(req.body.wallet_type == 'interest_wallet'){
                              const schema_create1 = new interest_withdraw_logModel()
                              schema_create1.userId = req.body.UserId
                              schema_create1.amount = interest_amt
                              schema_create1.bank_withdrawal_id = createPayout._id
                              schema_create1.wallet_type = req.body.transaction_type
                              interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                              const schema_create = new interest_withdraw_logModel()
                                  schema_create.userId = req.body.UserId
                                  schema_create.amount = staking_amt
                                  schema_create.bank_withdrawal_id = createPayout._id
                                  schema_create.wallet_type = "stake"
                                  interest_withdraw_logModel.create(schema_create).then(data=>{console.log(data)})
                              }
                              if(req.body.wallet_type == 'referral_wallet'){
                                const schema_create2 = new referral_withdraw_logModel()
                                schema_create2.userId = req.body.UserId
                                schema_create2.amount = req.body.withdrawal_amount
                                schema_create2.bank_withdrawal_id = createPayout._id
                                schema_create2.wallet_type = req.body.transaction_type
                                referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                                }
                          })
                          if(req.body.wallet_type == 'interest_wallet'){
                            interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                              {total_amount : parseFloat(interest_wallet.total_amount) -parseFloat(interest_amt)},
                              {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});

                              stake_interest_walletModel.findOne({UserId: req.body.UserId})
                            .then(data_amount=>{
                              console.log(data_amount,"data_amount1")
                              const data_save = parseFloat(data_amount.total_amount)-parseFloat(staking_amt)
                              console.log(data_save,"datasave1")
                              stake_interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                {total_amount : parseFloat(data_save)},
                                {new:true}).then(update_wallet1=>{console.log(update_wallet1,"update_wallet")});
                            })
                          }else if(req.body.wallet_type == 'referral_wallet'){
                            referral_walletModel.findOne({userId: req.body.UserId})
                                .then(data_amount=>{
                                  const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                console.log(data_save,"datasave")
                                referral_walletModel.findOneAndUpdate({userId: req.body.UserId},
                                  {total_amount :parseFloat(data_save)},
                                  {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                                })
                          }else if(req.body.wallet_type == 'netstaking_wallet'){
                            net_staking_walletModel.findOne({UserId: req.body.UserId})
                            .then(data_amount=>{
                              const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                              console.log(data_save,"datasave")
                              net_staking_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                {total_amount : parseFloat(data_save)},
                                {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                            })
                           }
                        res.status(200).send({
                            message:"payment withdrawal successfully",
                            status:1,
                            error:null
                        })
                        }else{
                          res.status(200).send({
                            data:null,
                            message:"maximum amount of withdraw is 3000",
                            status:0
                          })
                        }
                      }else{
                        res.status(200).send({
                          data:null,
                          message:"Need to withdraw minimum 500",
                          status:0
                        })
                      }
                    }else{
                      var amount = 0
                      for(let i=0;i<find_payout.length;i++){
                        amount = amount + find_payout[i].withdrawal_amount
                      }
                      if(amount >= 3000){
                        res.send({
                          message:"today withdraw limit is completed",
                          status:0
                        })
                      }else{
                        const data = 3000 - parseFloat(amount)
                        if(req.body.withdrawal_amount <= data){
                          if(req.body.withdrawal_amount >= 500){ // 1
                            if(req.body.withdrawal_amount <= 3000){
                              const one = parseFloat((req.body.withdrawal_amount)*10/100);
                              const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one);
                              const schema = new bank_payoutModel()
                              schema.UserId = req.body.UserId
                              schema.name_as_per_bank = req.body.name_as_per_bank
                              schema.email = "GGO@payment.com"
                              schema.phone_number = req.body.mobileno
                              schema.created_at = Date.now()
                              schema.bank_name = req.body.bank_name
                              schema.account_number = req.body.account_number
                              schema.ifsc_code = req.body.ifsc_code
                              schema.withdrawal_amount = req.body.withdrawal_amount
                              schema.fees = req.body.fees
                              schema.gas_fee = req.body.gas_fee
                              schema.transaction_fee = req.body.transaction_fee
                              schema.bridging_fee = req.body.bridging_fee
                              schema.tds = req.body.tds  
                              schema.confirmed_withdrawal = req.body.withdrawal_amount
                              schema.status = 'Inprocess'
                              schema.withdrawal_type = req.body.wallet_type
                              schema.previous_transaction = wallet_amount
                              schema.transaction_type = req.body.transaction_type
                              if(req.body.wallet_type == 'interest_wallet'){
                                schema.liquidity_interest = interest_amt
                                schema.stake_interest = staking_amt
                              }
                              bank_payoutModel.create(schema).then(createPayout=>{
                                console.log(createPayout,"dvhgfdvg")
                                // console.log(parseFloat(wallet_amount.total_amount) - req.body.amount,"amount_data")
                                userModel.findOneAndUpdate({_id:find_user._id},{
                                  withdraw_verify:false,
                                  passcode: random_number,
                                  current_withdraw:false
                                },{new:true}).then(data121=>{console.log(data121)})
                                if(req.body.wallet_type == 'netstaking_wallet'){
                                  const schema_create = new net_staking_withdrawal_logModel()
                                  schema_create.userId = req.body.UserId
                                  schema_create.amount = req.body.withdrawal_amount;
                                  schema_create.bank_withdrawal_id = createPayout._id
                                  schema_create.wallet_type = req.body.transaction_type
                                  net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                                }
                                if(req.body.wallet_type == 'interest_wallet'){
                                  const schema_create = new interest_withdraw_logModel()
                                  schema_create.userId = req.body.UserId
                                  schema_create.amount = interest_amt
                                  schema_create.bank_withdrawal_id = createPayout._id
                                  schema_create.wallet_type = req.body.transaction_type
                                  interest_withdraw_logModel.create(schema_create).then(data222=>{console.log(data222)})
                                  const schema_create1 = new interest_withdraw_logModel()
                                  schema_create1.userId = req.body.UserId
                                  schema_create1.amount = staking_amt
                                  schema_create1.bank_withdrawal_id = createPayout._id
                                  schema_create1.wallet_type = "stake"
                                  interest_withdraw_logModel.create(schema_create1).then(data=>{console.log(data)})
                                  }
                                  if(req.body.wallet_type == 'referral_wallet'){
                                    const schema_create2 = new referral_withdraw_logModel()
                                    schema_create2.userId = req.body.UserId
                                    schema_create2.amount = req.body.withdrawal_amount
                                    schema_create2.bank_withdrawal_id = createPayout._id
                                    schema_create2.wallet_type = req.body.transaction_type
                                    referral_withdraw_logModel.create(schema_create2).then(data333=>{console.log(data333)})
                                    }
                              })
                              if(req.body.wallet_type == 'interest_wallet'){
                                interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                  {total_amount : parseFloat(interest_wallet.total_amount) -parseFloat(interest_amt)},
                                  {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});

                                  stake_interest_walletModel.findOne({UserId: req.body.UserId})
                                  .then(data_amount=>{
                                    console.log(data_amount,"data_amount1")
                                    const data_save = parseFloat(data_amount.total_amount)-parseFloat(staking_amt)
                                    console.log(data_save,"datasave2")
                                    stake_interest_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                      {total_amount : parseFloat(data_save)},
                                      {new:true}).then(update_wallet1=>{console.log(update_wallet1,"update_wallet")});
                                  })
                              }else if(req.body.wallet_type == 'referral_wallet'){
                                referral_walletModel.findOne({userId: req.body.UserId})
                                .then(data_amount=>{
                                  const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                console.log(data_save,"datasave")
                                referral_walletModel.findOneAndUpdate({userId: req.body.UserId},
                                  {total_amount :parseFloat(data_save)},
                                  {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                                })
                              }else if(req.body.wallet_type == 'netstaking_wallet'){
                                net_staking_walletModel.findOne({UserId: req.body.UserId})
                                .then(data_amount=>{
                                  const data_save = parseFloat(data_amount.total_amount)-parseFloat(req.body.withdrawal_amount)
                                  console.log(data_save,"datasave")
                                  net_staking_walletModel.findOneAndUpdate({UserId: req.body.UserId},
                                    {total_amount : parseFloat(data_save)},
                                    {new:true}).then(update_wallet=>{console.log(update_wallet,"update_wallet")});
                                })
                               }
                               res.status(200).send({
                                message:"payment withdrawal successfully",
                                status:1,
                                error:null
                            })
                            }else{
                              res.status(200).send({
                                data:null,
                                message:"maximum amount of withdraw is 3000",
                                status:0
                              })
                            }
                          }else{
                            res.status(200).send({
                              data:null,
                              message:"Need to withdraw minimum 500",
                              status:0
                            })
                          }
                        }else{
                          res.send({
                            message:`your withdraw limit is ${data}`
                          })
                        }
                      }
                    }
                    }
                    
                  }else{
                    res.status(200).send({
                      data: null,
                      message: "you don't have enough money in your wallet",
                      status: 0,
                    });
                  }
                
              // }else{
              //   res.status(200).send({
              //     data: null,
              //     message: "you're not verify withdraw",
              //     status: 0,
              //   });
              // }
            }else{
              res.status(200).send({
                data:null,
                message:"Need to deposit",
                status:0
              })
            }
          }else{
            res.status(200).send({
              data: null,
              message: "verify your kyc",
              status: 0,
            });
          }
        }else{
          res.status(200).send({
            data: null,
            message: "You last withdraw is in Process.",
            status: 0,
          });
        }
      }else{
        res.status(200).send({
          data: null,
          message: "Unable to Withdraw.",
          status: 0,
        });
      }               
      }else {
        res.status(200).send({
          data: null,
          message: "User not found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        status: 0,
        message: "Error in withdrawal payment",
      });
    }
  }

};
