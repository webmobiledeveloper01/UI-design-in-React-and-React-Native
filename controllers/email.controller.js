const otpGenerator = require("otp-generator");
const  sendEmail  = require('../modules/mail')
const data = require('../modules');
const userModel = require("../models/user.model");
const interest_walletModel = require("../models/interest_wallet.model");
const referral_walletModel = require("../models/referral_wallet.model");
const net_staking_walletModel = require("../models/net_staking_wallet.model");
const payoutModel = require("../models/payout.model");
const stake_nsr_walletModel = require("../models/stake_nsr_wallet.model");
const stake_interest_walletModel = require("../models/stake_interest_wallet.model");
const stake_referral_walletModel = require("../models/stake_referral_wallet.model");

module.exports={
  async send_passcode(req, res, next) {
    const timeStamp = new Date().getTime();
    const yesterdayTimeStamp = timeStamp - 24 * 60 * 60 * 1000;
    const yesterdayDate = new Date(yesterdayTimeStamp);
    const date_dataA = yesterdayDate.toISOString().slice(0, 10);
    const datayw = "T23:59:59.720Z";
    const data_m = date_dataA + datayw;
    const Date_date = new Date(data_m);
    try {
      const find_user = await userModel.findOne({ _id: req.body.UserId }).lean();
      if (find_user) {
        if (!find_user.first_deposit) {

          
            const last_payouts = await payoutModel.find({UserId:req.body.UserId}).lean();
            var total_payout = 0
            for(let i=0;i<last_payouts.length;i++){
              total_payout = total_payout+last_payouts[i].amount
            }
            console.log(total_payout,"total_payout");
         
            var wallet_amount;
                  var wallet;
                  if(req.body.wallet_type=='interest_wallet'){
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
                  }else if(req.body.wallet_type == 'referral_wallet'){
                    wallet = await referral_walletModel.findOne({userId: req.body.UserId});
                    wallet_amount=wallet.total_amount;
                  }else if(req.body.wallet_type == 'netstaking_wallet'){
                    wallet = await net_staking_walletModel.findOne({UserId: req.body.UserId});
                    wallet_amount=wallet.total_amount;
                  }
          
            if (wallet_amount >= req.body.amount) {
              const find_payout = await payoutModel.find({ UserId: req.body.UserId, createdAt: { $gte: data_m } }).sort({ _id: -1 });

              if (find_payout.length < 1) {
                if (req.body.amount >= 500) {
                  if (req.body.amount <= 3000) {
                    const random_number = otpGenerator.generate(6, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false,});
                    const update_passcode = await userModel.findOneAndUpdate({ _id: find_user._id },{ withdraw_verify: false, passcode: random_number },{ new: true });
                    console.log(update_passcode, "data");
                    sendEmail({
                      html: data.PASSCODE.html(update_passcode, req.body.amount),
                      subject: "GGO Passcode",
                      email: find_user.email,
                    });
                    res.status(200).send({
                      data: update_passcode,
                      message: "email sent successfully",
                      status: 1,
                      error: null,
                    });
                  } 
                  else {
                    res.status(200).send({
                      message: "maximum withdraw amount is 3000",
                      status: 0,
                    });
                  }
                } else {
                  res.status(200).send({
                    message: "minimum withdraw amount is 500",
                    status: 0,
                  });
                }
              } 
              else {
                var amount = 0;
                for (let i = 0; i < find_payout.length; i++) {
                  amount = amount + find_payout[i].amount;
                }
                if (amount >= 3000) {
                  res.send({
                    message: "today withdraw limit is completed",
                    status: 0,
                  });
                } 
                else {
                  const data_amount = 3000 - parseFloat(amount);
                  if (req.body.amount <= data_amount) {
                    const random_number = otpGenerator.generate(6, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false});
                    const update_passcode = await userModel.findOneAndUpdate({ _id: find_user._id }, { withdraw_verify: false, passcode: random_number,}, { new: true });
                    console.log(update_passcode, "data");
                    sendEmail({
                      html: data.PASSCODE.html(update_passcode, req.body.amount),
                      subject: "GGO Passcode",
                      email: find_user.email,
                    });
                    res.status(200).send({
                      data: update_passcode,
                      message: "email sent successfully",
                      status: 1,
                      error: null,
                    });
                  } else {
                    res.send({
                      message: `your withdraw limit is ${data_amount}`,
                    });
                  }
                }
              }
            } 
            else {
              res.status(200).send({
                message: "your wallet amount is low",
                status: 0,
              });
            }
          

          

        } 
        else {
          res.status(200).send({
            data: null,
            message: "Need to deposit first",
            status: 0,
          });
        }
      } 
      else {
        res.status(200).send({
          data: null,
          message: "User not found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "error in passcode email",
        status: 0,
      });
    }
  },

      async verify_email(req,res,next){
        try{
          const find_user = await userModel.findOne({_id:req.body.UserId}).lean();
          if(find_user){
            const random_number = otpGenerator.generate(6, {
              upperCaseAlphabets: false,
              specialChars: false,
              lowerCaseAlphabets: false,
            });
            const update_user = await userModel.findOneAndUpdate({_id:req.body.UserId},{
              email_verify_code:random_number,
            },{new:true})
            sendEmail({
              html: data.VERIFYEMAIL.html(update_user.email_verify_code),
              subject: "GGO Passcode",
              email: find_user.email,
            });
            res.status(200).send({
              data:update_user,
              message:"verification code send to you email",
              status:1,
              error:null
            })
          }
          else{
            res.status(200).send({
              data:null,
              message:"user not found",
              status:0
            })
          }
        }
        catch(error){
          res.status(400).send({
            error:error,
            message:"error in email verify",
            status:0
          })
        }
      },

      async check_email_otp(req,res,next){
        try{
          const find_user = await userModel.findOne({_id:req.body.UserId}).lean();
          if(find_user){
            if(find_user.email_verify_code == req.body.verification_code){
              const update_user = await userModel.findOneAndUpdate({_id:req.body.UserId},{
                email_verify:true
              },{new:true}) 
              res.status(200).send({
                data:update_user,
                message:"email verified successfully",
                status:1,
                error:null
              })
            }else{
              res.status(200).send({
                data:null,
                message:"Invalid verification code",
                status:0
              })
            }
          }
          else{
            res.status(200).send({
              data:null,
              message:"user not found",
              status:0
            })
          }
        }
        catch(error){
          res.status(400).send({
            error:error,
            message:"error in email code checking",
            status:0
          })
        }
      } 
}