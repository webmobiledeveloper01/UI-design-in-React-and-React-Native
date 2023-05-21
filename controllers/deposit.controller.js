const deposit_logModel = require("../models/deposit_log.model");
const paymentModel = require("../models/payment.model");
const userModel = require("../models/user.model");
const axios = require("axios");
const otpGenerator = require("otp-generator");
const mongoose = require("mongoose");
const payment_logModel = require("../models/payment_log.model");
const referral_walletModel = require("../models/referral_wallet.model");
const schedule = require("node-schedule");
const interest_logModel = require("../models/interest_log.model");
const interest_walletModel = require("../models/interest_wallet.model");
const getSymbolFromCurrency = require("currency-symbol-map");
const intrest_historyModel = require("../models/interest_history.model");
const interest_historyModel = require("../models/interest_history.model");
const { findOne } = require("../models/deposit_log.model");
const poolingModel = require("../models/pooling.model");
const pooling_batchModel = require("../models/pooling_batch.model");
const net_staking_walletModel = require("../models/net_staking_wallet.model");
var uuid = require('uuid-random');
const deposit_detailsModel = require("../models/deposit_details.model");
const deposit_dataModel = require("../models/deposit_data.model");
const interest_withdraw_logModel = require("../models/interest_withdraw_log.model");
const referral_withdraw_logModel = require("../models/referral_withdraw_log.model");
const net_staking_withdrawal_logModel = require("../models/net_staking_withdrawal_log.model");
const stake_deposit_walletModel = require("../models/stake_deposit_wallet.model");
const stake_nsr_walletModel = require("../models/stake_nsr_wallet.model");
const stake_interest_walletModel = require("../models/stake_interest_wallet.model");
const stake_referral_walletModel = require("../models/stake_referral_wallet.model");
const referrals_logModel = require("../models/referrals_log.model");
const Razorpay = require('razorpay');
const sendEmail = require("../modules/mail");
const deposit_reportsModel = require("../models/deposit_reports.model");

const data = require("../modules");
var instance = new Razorpay({
  key_id: 'rzp_live_ODLS9tshx0rdtM',
  key_secret: 'dfC1JwJhkais46WuC30okbuU',
});

module.exports = {
  async deposit(req, res, next) {
    try {
      const find_user = await userModel.findOne({ _id: req.body.userId });
      if (find_user) {
        var options = {
          amount: parseInt(req.body.amount) *100,
          currency: "INR",
          receipt: uuid(),
       
        };
        instance.orders.create(options, async(err, order) => {
          if(err) return res.status(200).send({ 'status': 0, 'message': 'Error in razorpay generation'});
          console.log(order,'order');
          if(order){
            res.status(200).send({
              data: order,
              message: "created orderId for deposit",
              status: 1,
              error:null
            });
          }
          else{
            res.status(200).send({
                data: order,
                message: "deposit failed",
                status: 0
              });
          }
          
        })
      } else {
        res.status(200).send({
          data: null,
          message: "user not found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "error in deposit",
        status: 0,
      });
    }
  },

  async paymentLog(req, res, next) {
    try {
     
    const find_user = await userModel.findOne({ _id: req.body.UserId });
    console.log(find_user,"find_user")
      if (find_user) {
        const amount = req.body.amount
        const update_no = await userModel.findOneAndUpdate({_id:find_user},{
          mobileno:req.body.mobileno
        },{new:true});
        const schema =new payment_logModel()
        schema.UserId = req.body.UserId;
        schema.OrderId = req.body.OrderId;
        schema.pay_id = req.body.pay_id;
        schema.amount = amount;
        schema.type = "Razorpay Payment";
        schema.message = "Transaction Success";
        schema.status = req.body.status;
        schema.time = Date.now();
        console.log(req.body,"req.body");
        const create_log = await payment_logModel.create(schema);
        console.log(create_log,"create_log")
        if(create_log){
            const price = await axios.get(
                "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
              );
              console.log(price.data.pairs[0].priceUsd, "prices");
              const GGO_usd = price.data.pairs[0].priceUsd;
              
              const currency_value = 77.96;
              console.log(currency_value, "data");
              const GGO_inr = parseFloat(currency_value * GGO_usd);
              console.log(GGO_inr, "data1");
              const total_ggo = amount / GGO_inr;
              console.log(total_ggo, "data");
              const random_number1 = otpGenerator.generate(5, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
              });
              const transaction_id = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
              });
      
              if (find_user.first_deposit == true) {               
                
                const schema = new deposit_logModel();
                schema.userId = req.body.UserId;
                schema.crypto = total_ggo;
                schema.holding_price = GGO_inr;
                schema.staking_id = random_number1;
                schema.orderId = req.body.OrderId;
                schema.amount = amount;
                schema.paymentCompleted = true;
                schema.currencyType = "INR";
                schema.paymentType = "GGO-wallet";
                schema.status = "Success";
                const deposit_log = await deposit_logModel.create(schema);
                const find_payment = await paymentModel.findOne({
                  userId: req.body.UserId,
                });
                // checking interest
                var weekly_pr;
                var annual_pr;
                var monthly_pr;
                var stak_reward;
                if (req.body.amount <= 10000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.23;
                  monthly_pr = 1.44;
                  stak_reward = 0.0010;
                } else if (req.body.amount <= 20000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.26;
                  monthly_pr = 1.44;
                  stak_reward = 0.0021;
                } else if (req.body.amount <= 30000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.34;
                  monthly_pr = 1.45;
                  stak_reward = 0.0031;
                } else if (req.body.amount <= 40000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.38;
                  monthly_pr = 1.45;
                  stak_reward = 0.0042;
                } else if (req.body.amount <= 50000) {
                  weekly_pr = 0.34;
                  annual_pr = 17.48;
                  monthly_pr = 1.46;
                  stak_reward = 0.0052;
                } else if (req.body.amount <= 60000) {
                  weekly_pr = 0.34;
                  annual_pr = 17.68;
                  monthly_pr = 1.47;
                  stak_reward = 0.0063;
                } else if (req.body.amount <= 70000) {
                  weekly_pr = 0.34;
                  annual_pr = 17.84;
                  monthly_pr = 1.49;
                  stak_reward = 0.0073;
                } else if (req.body.amount <= 80000) {
                  weekly_pr = 0.35;
                  annual_pr = 17.96;
                  monthly_pr = 1.5;
                  stak_reward = 0.0084;
                } else if (req.body.amount <= 90000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.02;
                  monthly_pr = 1.5;
                  stak_reward = 0.0094;
                } else if (req.body.amount <= 100000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.16;
                  monthly_pr = 1.51;
                  stak_reward = 0.0105;
                } else if (req.body.amount <= 110000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.28;
                  monthly_pr = 1.52;
                  stak_reward = 0.0115;
                } else if (req.body.amount <= 120000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.34;
                  monthly_pr = 1.53;
                  stak_reward = 0.0126;
                } else if (req.body.amount <= 130000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.49;
                  monthly_pr = 1.54;
                  stak_reward = 0.0136;
                } else if (req.body.amount <= 140000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.56;
                  monthly_pr = 1.55;
                  stak_reward = 0.0147;
                } else if (req.body.amount <= 150000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.68;
                  monthly_pr = 1.56;
                  stak_reward = 0.0157;
                } else if (req.body.amount <= 160000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.72;
                  monthly_pr = 1.56;
                  stak_reward = 0.0167;
                } else if (req.body.amount <= 170000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.75;
                  monthly_pr = 1.56;
                  stak_reward = 0.0178;
                } else if (req.body.amount <= 180000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.82;
                  monthly_pr = 1.57;
                  stak_reward = 0.0188;
                } else if (req.body.amount <= 190000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.86;
                  monthly_pr = 1.57;
                  stak_reward = 0.0199;
                } else if (req.body.amount <= 200000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0209;
                } else if (req.body.amount <= 210000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0220;
                } else if (req.body.amount <= 220000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0230;
                } else if (req.body.amount <= 230000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0241;
                } else if (req.body.amount <= 240000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0251;
                } else if (req.body.amount <= 250000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0262;
                } else if (req.body.amount <= 260000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0272;
                } else if (req.body.amount <= 270000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0283;
                } else if (req.body.amount <= 280000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0293;
                } else if (req.body.amount <= 290000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0303;
                } else if (req.body.amount <= 300000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0314;
                } else if (req.body.amount <= 310000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0324;
                } else if (req.body.amount <= 320000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0335;
                } else if (req.body.amount <= 330000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0345;
                } else if (req.body.amount <= 340000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0356;
                } else if (req.body.amount <= 350000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0366;
                } else if (req.body.amount <= 360000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0377;
                } else if (req.body.amount <= 370000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0387;
                } else if (req.body.amount <= 380000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0398;
                } else if (req.body.amount <= 390000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0408;
                } else if (req.body.amount <= 400000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0419;
                } else if (req.body.amount <= 410000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0429;
                } else if (req.body.amount <= 420000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0440;
                } else if (req.body.amount <= 430000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0450;
                } else if (req.body.amount <= 440000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0460;
                } else if (req.body.amount <= 450000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0471;
                } else if (req.body.amount <= 460000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0481;
                } else if (req.body.amount <= 470000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0492;
                } else if (req.body.amount <= 480000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0502;
                } else if (req.body.amount <= 490000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0513;
                } else if (req.body.amount <= 500000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 650000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 900000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.46;
                  monthly_pr = 1.62;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 1275000) {
                  weekly_pr = 0.38;
                  annual_pr = 19.85;
                  monthly_pr = 1.65;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 1560000) {
                  weekly_pr = 0.4;
                  annual_pr = 20.63;
                  monthly_pr = 1.72;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 2100000) {
                  weekly_pr = 0.4;
                  annual_pr = 20.97;
                  monthly_pr = 1.75;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 2750000) {
                  weekly_pr = 0.46;
                  annual_pr = 23.91;
                  monthly_pr = 1.99;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 5000000) {
                  weekly_pr = 0.51;
                  annual_pr = 26.27;
                  monthly_pr = 2.19;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 10000000) {
                  weekly_pr = 0.52;
                  annual_pr = 26.97;
                  monthly_pr = 2.25;
                  stak_reward = 0.0523;
                }
      
                const weekly_payout = (weekly_pr * amount) / 100;
                const monthly_payout = (monthly_pr * amount) / 100;
                const annual_payout = (annual_pr * amount) / 100;
                // end checking interest
                // staking rewards

                setInterval(() => {
                  net_staking_walletModel
                    .findOne({ UserId: req.body.UserId })
                    .then((result) => {
                      net_staking_walletModel
                        .findOneAndUpdate(
                          { UserId: req.body.UserId },
                          {
                            total_amount:
                              parseFloat(result.total_amount) +
                              parseFloat(stak_reward),
                          },
                          { new: true }
                        )
                        .then((data1) => {
                          // console.log(data1);
                        });
                    });
                }, 1000);

                // staking rewards
                // interest adding
                const d = new Date();
                let day = d.getDay();
                let month = d.getMonth();
                let date = d.getDate();
                let hour = d.getHours();
                let min = d.getMinutes();
                if (req.body.interest_type == "weekly") {
                  const schema1 = new intrest_historyModel();
                  schema1.UserId = deposit_log.userId;
                  schema1.deposit_id = deposit_log._id;
                  schema1.transaction_id = transaction_id;
                  schema1.staking_id = deposit_log.staking_id;
                  schema1.intrest_amount = parseFloat(weekly_payout);
                  schema1.amount = amount;
                  schema1.status = true;
                  schema1.interest_percentage = weekly_pr;
                  schema1.day = day;
                  schema1.hours = hour;
                  schema1.minute = min;
                  schema1.interest_type = "weekly";
                  const create_history = await intrest_historyModel.create(schema1);
                  console.log(create_history, "data");
                  schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
                    console.log(req.body, "data");
                    const schema = new interest_logModel();
                    schema.UserId = deposit_log.userId;
                    schema.interest_amount = parseFloat(weekly_payout);
                    schema.status = "success";
                    schema.payment_completed = true;
                    schema.intrest_type = "weekly";
                    schema.hours = hour;
                    schema.day = day;
                    schema.minute = min;
                    const create_interest = await interest_logModel.create(schema);
                    const find_interest_wallet = await interest_walletModel.findOne({
                      UserId: deposit_log.userId,
                    });
                    if (find_interest_wallet) {
                      const update_interest_wallet =
                        await interest_walletModel.findOneAndUpdate(
                          { UserId: deposit_log.userId },
                          {
                            total_amount:
                              parseFloat(find_interest_wallet.total_amount) +
                              parseFloat(weekly_payout),
                          },
                          { new: true }
                        );
                    } else {
                      const schema1 = new interest_walletModel();
                      schema1.UserId = deposit_log.userId;
                      schema1.total_amount = parseFloat(weekly_payout);
                      const create_interest_wallet =
                        await interest_walletModel.create(schema1);
                    }
                  });
                } else if (req.body.interest_type == "monthly") {
                  const schema1 = new intrest_historyModel();
                  schema1.UserId = deposit_log.userId;
                  schema1.deposit_id = deposit_log._id;
                  schema1.transaction_id = transaction_id;
                  schema1.staking_id = deposit_log.staking_id;
                  schema1.intrest_amount = parseFloat(monthly_payout);
                  schema1.amount = amount;
                  schema1.status = true;
                  schema1.interest_percentage = monthly_pr;
                  schema1.date = date;
                  schema1.hours = hour;
                  schema1.minute = min;
                  schema1.interest_type = "monthly";
                  const create_history = await intrest_historyModel.create(schema1);
                  console.log(create_history, "data");
                  schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
                    console.log(req.body, "data");
                    const schema = new interest_logModel();
                    schema.UserId = deposit_log.userId;
                    schema.interest_amount = parseFloat(monthly_payout);
                    schema.status = "success";
                    schema.payment_completed = true;
                    schema.intrest_type = "monthly";
                    schema.hours = hour;
                    schema.date = date;
                    schema.minute = min;
                    const create_interest = await interest_logModel.create(schema);
                    const find_interest_wallet = await interest_walletModel.findOne({
                      UserId: deposit_log.userId,
                    });
                    if (find_interest_wallet) {
                      const update_interest_wallet =
                        await interest_walletModel.findOneAndUpdate(
                          { UserId: deposit_log.userId },
                          {
                            total_amount:
                              parseFloat(find_interest_wallet.total_amount) +
                              parseFloat(monthly_payout),
                          },
                          { new: true }
                        );
                    } else {
                      const schema1 = new interest_walletModel();
                      schema1.UserId = deposit_log.userId;
                      schema1.total_amount = parseFloat(monthly_payout);
                      const create_interest_wallet =
                        await interest_walletModel.create(schema1);
                    }
                  });
                } else if (req.body.interest_type == "yearly") {
                  const schema1 = new intrest_historyModel();
                  schema1.UserId = deposit_log.userId;
                  schema1.deposit_id = deposit_log._id;
                  schema1.transaction_id = transaction_id;
                  schema1.staking_id = deposit_log.staking_id;
                  schema1.intrest_amount = parseFloat(annual_payout);
                  schema1.amount = amount;
                  schema1.status = true;
                  schema1.interest_percentage = annual_pr;
                  schema1.month = month;
                  schema1.date = date;
                  schema1.hours = hour;
                  schema1.minute = min;
                  schema1.interest_type = "yearly";
                  const create_history = await intrest_historyModel.create(schema1);
                  console.log(create_history, "data");
                  schedule.scheduleJob(
                    `${min} ${hour} ${date} ${month + 1} *`,
                    async () => {
                      console.log(req.body, "data");
                      const schema = new interest_logModel();
                      schema.UserId = deposit_log.userId;
                      schema.interest_amount = parseFloat(annual_payout);
                      schema.status = "success";
                      schema.payment_completed = true;
                      schema.intrest_type = "yearly";
                      schema.hours = hour;
                      schema.date = date;
                      schema.month = month + 1;
                      schema.minute = min;
                      const create_interest = await interest_logModel.create(schema);
                      const find_interest_wallet = await interest_walletModel.findOne(
                        { UserId: deposit_log.userId }
                      );
                      if (find_interest_wallet) {
                        const update_interest_wallet =
                          await interest_walletModel.findOneAndUpdate(
                            { UserId: deposit_log.userId },
                            {
                              total_amount:
                                find_interest_wallet.total_amount +
                                parseFloat(annual_payout),
                            },
                            { new: true }
                          );
                      } else {
                        const schema1 = new interest_walletModel();
                        schema1.UserId = deposit_log.userId;
                        schema1.total_amount = parseFloat(annual_payout);
                        const create_interest_wallet =
                          await interest_walletModel.create(schema1);
                      }
                    }
                  );
                } else {
                  res.status(200).send({
                    data: null,
                    message: "wrong Interest type1",
                    status: 0,
                  });
                }
                // ending interest adding
      
                if (find_payment) {
                  const find_net_wallet = await net_staking_walletModel.findOne({UserId: req.body.UserId})
                  const update_net_staking =
                      await net_staking_walletModel.findOneAndUpdate(
                        { UserId: req.body.UserId },
                        {
                          total_amount: parseFloat(find_net_wallet.total_amount) +  500,
                        },
                        { new: true }
                      );
                    const update_user = await userModel.findOneAndUpdate(
                      { _id: req.body.UserId },
                      {
                        add_bonus: false,
                      },
                      { new: true }
                    );
                  const update_payment = await paymentModel.findOneAndUpdate(
                    { userId: req.body.UserId },
                    {
                      total_amount:
                        parseFloat(find_payment.total_amount) +
                        parseFloat(amount),
                      crypto:
                        parseFloat(find_payment.crypto) + parseFloat(total_ggo),
                    },
                    { new: true }
                  );
                  
                  console.log(update_payment,'update_payment')
                } else {
                  const schema_main = new paymentModel();
                  schema_main.userId = req.body.UserId;
                  schema_main.total_amount = amount;
                  schema_main.crypto = parseFloat(total_ggo);
                  const create_payment = await paymentModel.create(schema_main);
                }
                const update_user = await userModel.findOneAndUpdate(
                  { _id: req.body.UserId },
                  {
                    first_deposit: false,
                  },
                  { new: true }
                );
                if (deposit_log) {
                  if (find_user.refered_by) {
                    const find_refuser = await userModel.findOne({
                      referal_id: find_user.refered_by,
                    });
                    if (find_refuser) {
                      const one_refer = (parseInt(amount) * 5) / 100;
                      const four_refer = (parseInt(amount) * 4) / 100;
                      const three_refer = (parseInt(amount) * 3) / 100;
                      const last_refer = (parseInt(amount) * 1) / 100;
                      const two_refer = (parseInt(amount) * 2) / 100;
                      console.log(one_refer, "5%ref");
                      console.log(two_refer, "2%ref");
                      const find_refpayment = await referral_walletModel.findOne({
                        userId: find_refuser._id,
                      });
                      if (find_refpayment) {
                        const update_refpayment =
                          await referral_walletModel.findOneAndUpdate(
                            { userId: find_refuser._id },
                            {
                              total_amount:
                                parseFloat(find_refpayment.total_amount) +
                                parseFloat(one_refer),
                            },
                            { new: true }
                          );
                        if (find_refuser.refered_by) {
                          const find_ref2 = await userModel.findOne({
                            referal_id: find_refuser.refered_by,
                          });
                          if (find_ref2) {
                            const find_paymentref2 =
                              await referral_walletModel.findOne({
                                userId: find_ref2._id,
                              });
                            if (find_paymentref2) {
                              const update_ref2payment =
                                await referral_walletModel.findOneAndUpdate(
                                  { userId: find_ref2._id },
                                  {
                                    total_amount:
                                      parseFloat(find_paymentref2.total_amount) +
                                      parseFloat(four_refer),
                                  },
                                  { new: true }
                                );
                              if (find_ref2.refered_by) {
                                const find_ref3 = await userModel.findOne({
                                  referal_id: find_ref2.refered_by,
                                });
                                if (find_ref3) {
                                  const find_paymentref3 =
                                    await referral_walletModel.findOne({
                                      userId: find_ref3._id,
                                    });
                                  if (find_paymentref3) {
                                    const update_ref3payment =
                                      await referral_walletModel.findOneAndUpdate(
                                        { userId: find_ref3._id },
                                        {
                                          total_amount:
                                            parseFloat(
                                              find_paymentref3.total_amount
                                            ) + parseFloat(three_refer),
                                        },
                                        { new: true }
                                      );
                                    if (find_ref3.refered_by) {
                                      const find_ref4 = await userModel.findOne({
                                        referal_id: find_ref3.refered_by,
                                      });
                                      if (find_ref4) {
                                        const find_paymentref4 =
                                          await referral_walletModel.findOne({
                                            userId: find_ref4._id,
                                          });
                                        if (find_paymentref4) {
                                          const update_ref4payment =
                                            await referral_walletModel.findOneAndUpdate(
                                              { userId: find_ref4._id },
                                              {
                                                total_amount:
                                                  parseFloat(
                                                    find_paymentref4.total_amount
                                                  ) + parseFloat(two_refer),
                                              },
                                              { new: true }
                                            );
                                          if (find_ref4.refered_by) {
                                            const find_ref5 = await userModel.findOne(
                                              { referal_id: find_ref4.refered_by }
                                            );
                                            if (find_ref5) {
                                              const find_paymentref5 =
                                                await referral_walletModel.findOne({
                                                  userId: find_ref5._id,
                                                });
                                              if (find_paymentref5) {
                                                const update_ref5payment =
                                                  await referral_walletModel.findOneAndUpdate(
                                                    { userId: find_ref5._id },
                                                    {
                                                      total_amount:
                                                        parseFloat(
                                                          find_paymentref5.total_amount
                                                        ) + last_refer,
                                                    },
                                                    { new: true }
                                                  );
                                                if (update_ref5payment) {
                                                    res.status(200).send({
                                                        data: create_log,
                                                        message: "payment log created",
                                                        status: 1,
                                                        error: null,
                                                      });
                                                }
                                              } else {
                                                res.status(200).send({
                                                    data: create_log,
                                                    message: "payment log created",
                                                    status: 1,
                                                    error: null,
                                                  });
                                              }
                                            } else {
                                                res.status(200).send({
                                                    data: create_log,
                                                    message: "payment log created",
                                                    status: 1,
                                                    error: null,
                                                  });
                                            }
                                          } else {
                                            res.status(200).send({
                                                data: create_log,
                                                message: "payment log created",
                                                status: 1,
                                                error: null,
                                              });
                                          }
                                        } else {
                                            res.status(200).send({
                                                data: create_log,
                                                message: "payment log created",
                                                status: 1,
                                                error: null,
                                              });
                                        }
                                      } else {
                                        res.status(200).send({
                                            data: create_log,
                                            message: "payment log created",
                                            status: 1,
                                            error: null,
                                          });
                                      }
                                    } else {
                                        res.status(200).send({
                                            data: create_log,
                                            message: "payment log created",
                                            status: 1,
                                            error: null,
                                          });
                                    }
                                  } else {
                                    res.status(200).send({
                                        data: create_log,
                                        message: "payment log created",
                                        status: 1,
                                        error: null,
                                      });
                                  }
                                } else {
                                    res.status(200).send({
                                        data: create_log,
                                        message: "payment log created",
                                        status: 1,
                                        error: null,
                                      });
                                }
                              } else {
                                res.status(200).send({
                                    data: create_log,
                                    message: "payment log created",
                                    status: 1,
                                    error: null,
                                  });
                              }
                            } else {
                              const schemaref2 = new referral_walletModel();
                              schemaref2.userId = find_ref2._id;
                              schemaref2.total_amount = parseFloat(four_refer);
                              const add_ref2 = await referral_walletModel.create(
                                schemaref2
                              );
                              res.status(200).send({
                                data: create_log,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            res.status(200).send({
                                data: create_log,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                          }
                        } else {
                            res.status(200).send({
                                data: create_log,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                        }
                      } else {
                        res.status(200).send({
                            data: create_log,
                            message: "payment log created",
                            status: 1,
                            error: null,
                          });
                      }
                    } else {
                        res.status(200).send({
                            data: create_log,
                            message: "payment log created",
                            status: 1,
                            error: null,
                          });
                    }
                  } else {
                    res.status(200).send({
                        data: create_log,
                        message: "payment log created",
                        status: 1,
                        error: null,
                      });
                  }
                } else {
                  res.status(200).send({
                    data: deposit_log,
                    message: "error in deposit",
                    status: 0,
                  });
                }
              } else {
                
      
                const schema = new deposit_logModel();
                schema.userId = req.body.UserId;
                schema.crypto = total_ggo;
                schema.holding_price = GGO_inr;
                schema.staking_id = random_number1;
                schema.orderId = req.body.OrderId;
                schema.amount = amount;
                schema.paymentCompleted = true;
                schema.currencyType = "INR";
                schema.paymentType = "GGO-wallet";
                schema.status = "Success";
                const deposit_log = await deposit_logModel.create(schema);
                const find_payment = await paymentModel.findOne({
                  userId: req.body.UserId,
                });
      
                // checking interest
                var weekly_pr;
                var annual_pr;
                var monthly_pr;
                var stak_reward;
                if (req.body.amount <= 10000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.23;
                  monthly_pr = 1.44;
                  stak_reward = 0.0010;
                } else if (req.body.amount <= 20000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.26;
                  monthly_pr = 1.44;
                  stak_reward = 0.0021;
                } else if (req.body.amount <= 30000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.34;
                  monthly_pr = 1.45;
                  stak_reward = 0.0031;
                } else if (req.body.amount <= 40000) {
                  weekly_pr = 0.33;
                  annual_pr = 17.38;
                  monthly_pr = 1.45;
                  stak_reward = 0.0042;
                } else if (req.body.amount <= 50000) {
                  weekly_pr = 0.34;
                  annual_pr = 17.48;
                  monthly_pr = 1.46;
                  stak_reward = 0.0052;
                } else if (req.body.amount <= 60000) {
                  weekly_pr = 0.34;
                  annual_pr = 17.68;
                  monthly_pr = 1.47;
                  stak_reward = 0.0063;
                } else if (req.body.amount <= 70000) {
                  weekly_pr = 0.34;
                  annual_pr = 17.84;
                  monthly_pr = 1.49;
                  stak_reward = 0.0073;
                } else if (req.body.amount <= 80000) {
                  weekly_pr = 0.35;
                  annual_pr = 17.96;
                  monthly_pr = 1.5;
                  stak_reward = 0.0084;
                } else if (req.body.amount <= 90000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.02;
                  monthly_pr = 1.5;
                  stak_reward = 0.0094;
                } else if (req.body.amount <= 100000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.16;
                  monthly_pr = 1.51;
                  stak_reward = 0.0105;
                } else if (req.body.amount <= 110000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.28;
                  monthly_pr = 1.52;
                  stak_reward = 0.0115;
                } else if (req.body.amount <= 120000) {
                  weekly_pr = 0.35;
                  annual_pr = 18.34;
                  monthly_pr = 1.53;
                  stak_reward = 0.0126;
                } else if (req.body.amount <= 130000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.49;
                  monthly_pr = 1.54;
                  stak_reward = 0.0136;
                } else if (req.body.amount <= 140000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.56;
                  monthly_pr = 1.55;
                  stak_reward = 0.0147;
                } else if (req.body.amount <= 150000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.68;
                  monthly_pr = 1.56;
                  stak_reward = 0.0157;
                } else if (req.body.amount <= 160000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.72;
                  monthly_pr = 1.56;
                  stak_reward = 0.0167;
                } else if (req.body.amount <= 170000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.75;
                  monthly_pr = 1.56;
                  stak_reward = 0.0178;
                } else if (req.body.amount <= 180000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.82;
                  monthly_pr = 1.57;
                  stak_reward = 0.0188;
                } else if (req.body.amount <= 190000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.86;
                  monthly_pr = 1.57;
                  stak_reward = 0.0199;
                } else if (req.body.amount <= 200000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0209;
                } else if (req.body.amount <= 210000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0220;
                } else if (req.body.amount <= 220000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0230;
                } else if (req.body.amount <= 230000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0241;
                } else if (req.body.amount <= 240000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0251;
                } else if (req.body.amount <= 250000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0262;
                } else if (req.body.amount <= 260000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0272;
                } else if (req.body.amount <= 270000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0283;
                } else if (req.body.amount <= 280000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0293;
                } else if (req.body.amount <= 290000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0303;
                } else if (req.body.amount <= 300000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0314;
                } else if (req.body.amount <= 310000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0324;
                } else if (req.body.amount <= 320000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0335;
                } else if (req.body.amount <= 330000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0345;
                } else if (req.body.amount <= 340000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0356;
                } else if (req.body.amount <= 350000) {
                  weekly_pr = 0.36;
                  annual_pr = 18.9;
                  monthly_pr = 1.58;
                  stak_reward = 0.0366;
                } else if (req.body.amount <= 360000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0377;
                } else if (req.body.amount <= 370000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0387;
                } else if (req.body.amount <= 380000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0398;
                } else if (req.body.amount <= 390000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0408;
                } else if (req.body.amount <= 400000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0419;
                } else if (req.body.amount <= 410000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0429;
                } else if (req.body.amount <= 420000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0440;
                } else if (req.body.amount <= 430000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0450;
                } else if (req.body.amount <= 440000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0460;
                } else if (req.body.amount <= 450000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0471;
                } else if (req.body.amount <= 460000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0481;
                } else if (req.body.amount <= 470000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0492;
                } else if (req.body.amount <= 480000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0502;
                } else if (req.body.amount <= 490000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0513;
                } else if (req.body.amount <= 500000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 650000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.23;
                  monthly_pr = 1.6;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 900000) {
                  weekly_pr = 0.37;
                  annual_pr = 19.46;
                  monthly_pr = 1.62;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 1275000) {
                  weekly_pr = 0.38;
                  annual_pr = 19.85;
                  monthly_pr = 1.65;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 1560000) {
                  weekly_pr = 0.4;
                  annual_pr = 20.63;
                  monthly_pr = 1.72;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 2100000) {
                  weekly_pr = 0.4;
                  annual_pr = 20.97;
                  monthly_pr = 1.75;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 2750000) {
                  weekly_pr = 0.46;
                  annual_pr = 23.91;
                  monthly_pr = 1.99;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 5000000) {
                  weekly_pr = 0.51;
                  annual_pr = 26.27;
                  monthly_pr = 2.19;
                  stak_reward = 0.0523;
                } else if (req.body.amount <= 10000000) {
                  weekly_pr = 0.52;
                  annual_pr = 26.97;
                  monthly_pr = 2.25;
                  stak_reward = 0.0523;
                }
      
                const weekly_payout = (weekly_pr * amount) / 100;
                const monthly_payout = (monthly_pr * amount) / 100;
                const annual_payout = (annual_pr * amount) / 100;
                // end checking interest
                
                 // staking rewards
                 setInterval(() => {
                  net_staking_walletModel
                    .findOne({ UserId: req.body.UserId })
                    .then((result) => {
                      net_staking_walletModel
                        .findOneAndUpdate(
                          { UserId: req.body.UserId },
                          {
                            total_amount:
                              parseFloat(result.total_amount) +
                              parseFloat(stak_reward),
                          },
                          { new: true }
                        )
                        .then((data1) => {
                          // console.log(data1);
                        });
                    });
                }, 1000);

                // staking rewards

                // interest adding
                const d = new Date();
                let day = d.getDay();
                let month = d.getMonth();
                let date = d.getDate();
                let hour = d.getHours();
                let min = d.getMinutes();
                if (req.body.interest_type == "weekly") {
                  console.log(deposit_log.userId, "id");
                  const schema1 = new intrest_historyModel();
                  schema1.UserId = deposit_log.userId;
                  schema1.deposit_id = deposit_log._id;
                  schema1.transaction_id = transaction_id;
                  schema1.staking_id = deposit_log.staking_id;
                  schema1.intrest_amount = parseFloat(weekly_payout);
                  schema1.amount = amount;
                  schema1.status = true;
                  schema1.interest_percentage = weekly_pr;
                  schema1.day = day;
                  schema1.hours = hour;
                  schema1.minute = min;
                  schema1.interest_type = "weekly";
                  const create_history = await intrest_historyModel.create(schema1);
                  console.log(create_history, "create_history");
                  schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
                    const schema = new interest_logModel();
                    schema.UserId = deposit_log.userId;
                    schema.interest_amount = parseFloat(weekly_payout);
                    schema.status = "success";
                    schema.payment_completed = true;
                    schema.intrest_type = "weekly";
                    schema.hours = hour;
                    schema.day = day;
                    schema.minute = min;
                    const create_interest = await interest_logModel.create(schema);
                    const find_interest_wallet = await interest_walletModel.findOne({
                      UserId: deposit_log.userId,
                    });
                    if (find_interest_wallet) {
                      const update_interest_wallet =
                        await interest_walletModel.findOneAndUpdate(
                          { UserId: deposit_log.userId },
                          {
                            total_amount:
                              parseFloat(find_interest_wallet.total_amount) +
                              parseFloat(weekly_payout),
                          },
                          { new: true }
                        );
                    } else {
                      const schema1 = new interest_walletModel();
                      schema1.UserId = deposit_log.userId;
                      schema1.total_amount = parseFloat(weekly_payout);
                      const create_interest_wallet =
                        await interest_walletModel.create(schema1);
                    }
                  });
                } else if (req.body.interest_type == "monthly") {
                  const schema1 = new intrest_historyModel();
                  schema1.UserId = deposit_log.userId;
                  schema1.deposit_id = deposit_log._id;
                  schema1.transaction_id = transaction_id;
                  schema1.staking_id = deposit_log.staking_id;
                  schema1.intrest_amount = parseFloat(monthly_payout);
                  schema1.amount = amount;
                  schema1.status = true;
                  schema1.interest_percentage = monthly_pr;
                  schema1.date = date;
                  schema1.hours = hour;
                  schema1.minute = min;
                  schema1.interest_type = "monthly";
                  const create_history = await intrest_historyModel.create(schema1);
                  console.log(create_history, "create_history");
                  schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
                    const schema = new interest_logModel();
                    schema.UserId = deposit_log.userId;
                    schema.interest_amount = parseFloat(monthly_payout);
                    schema.status = "success";
                    schema.payment_completed = true;
                    schema.intrest_type = "monthly";
                    schema.hours = hour;
                    schema.date = date;
                    schema.minute = min;
                    const create_interest = await interest_logModel.create(schema);
                    const find_interest_wallet = await interest_walletModel.findOne({
                      UserId: deposit_log.userId,
                    });
                    if (find_interest_wallet) {
                      const update_interest_wallet =
                        await interest_walletModel.findOneAndUpdate(
                          { UserId: deposit_log.userId },
                          {
                            total_amount:
                              parseFloat(find_interest_wallet.total_amount) +
                              parseFloat(monthly_payout),
                          },
                          { new: true }
                        );
                    } else {
                      const schema1 = new interest_walletModel();
                      schema1.UserId = deposit_log.userId;
                      schema1.total_amount = parseFloat(monthly_payout);
                      const create_interest_wallet =
                        await interest_walletModel.create(schema1);
                    }
                  });
                } else if (req.body.interest_type == "yearly") {
                  const schema1 = new intrest_historyModel();
                  schema1.UserId = deposit_log.userId;
                  schema1.deposit_id = deposit_log._id;
                  schema1.transaction_id = transaction_id;
                  schema1.staking_id = deposit_log.staking_id;
                  schema1.intrest_amount = parseFloat(annual_payout);
                  schema1.amount = amount;
                  schema1.status = true;
                  schema1.interest_percentage = annual_pr;
                  schema1.month = month;
                  schema1.date = date;
                  schema1.hours = hour;
                  schema1.minute = min;
                  schema1.interest_type = "yearly";
                  const create_history = await intrest_historyModel.create(schema1);
                  console.log(create_history, "create_history");
                  schedule.scheduleJob(
                    `${min} ${hour} ${date} ${month + 1} *`,
                    async () => {
                      const schema = new interest_logModel();
                      schema.UserId = deposit_log.userId;
                      schema.interest_amount = parseFloat(annual_payout);
                      schema.status = "success";
                      schema.payment_completed = true;
                      schema.intrest_type = "yearly";
                      schema.hours = hour;
                      schema.date = date;
                      schema.month = month + 1;
                      schema.minute = min;
                      const create_interest = await interest_logModel.create(schema);
                      const find_interest_wallet = await interest_walletModel.findOne(
                        { UserId: deposit_log.userId }
                      );
                      if (find_interest_wallet) {
                        const update_interest_wallet =
                          await interest_walletModel.findOneAndUpdate(
                            { UserId: deposit_log.userId },
                            {
                              total_amount:
                                parseFloat(find_interest_wallet.total_amount) +
                                parseFloat(annual_payout),
                            },
                            { new: true }
                          );
                      } else {
                        const schema1 = new interest_walletModel();
                        schema1.UserId = deposit_log.userId;
                        schema1.total_amount = parseFloat(annual_payout);
                        const create_interest_wallet =
                          await interest_walletModel.create(schema1);
                      }
                    }
                  );
                } else {
                  res.status(200).send({
                    data: null,
                    message: "wrong Interest type2",
                    status: 0,
                  });
                }
                // ending interest adding
                
      
                if (find_payment) {
                  const update_payment = await paymentModel.findOneAndUpdate(
                    { userId: req.body.UserId },
                    {
                      total_amount:
                        parseFloat(find_payment.total_amount) +
                        parseFloat(amount),
                      crypto: parseFloat(find_payment.crypto) + parseFloat(total_ggo),
                    },
                    { new: true }
                  );
                  console.log(update_payment,"update_payment")
                } else {
                  const schema_main = new paymentModel();
                  schema_main.userId = req.body.UserId;
                  schema_main.total_amount = amount;
                  schema_main.crypto = parseFloat(total_ggo);
                  const create_payment = await paymentModel.create(schema_main);
                  
                }
                if (deposit_log) {
                  if (find_user.refered_by) {
                    const find_refuser = await userModel.findOne({
                      referal_id: find_user.refered_by,
                    });
                    if (find_refuser) {
                      const one_refer = (parseInt(amount) * 5) / 100;
                      const four_refer = (parseInt(amount) * 4) / 100;
                      const three_refer = (parseInt(amount) * 3) / 100;
                      const last_refer = (parseInt(amount) * 1) / 100;
                      const two_refer = (parseInt(amount) * 2) / 100;
                      console.log(one_refer, "5%ref");
                      console.log(two_refer, "2%ref");
                      const find_refpayment = await referral_walletModel.findOne({
                        userId: find_refuser._id,
                      });
                      if (find_refpayment) {
                        const update_refpayment =
                          await referral_walletModel.findOneAndUpdate(
                            { userId: find_refuser._id },
                            {
                              total_amount:
                                parseFloat(find_refpayment.total_amount) +
                                parseFloat(one_refer),
                            },
                            { new: true }
                          );
                        if (find_refuser.refered_by) {
                          const find_ref2 = await userModel.findOne({
                            referal_id: find_refuser.refered_by,
                          });
                          if (find_ref2) {
                            const find_paymentref2 =
                              await referral_walletModel.findOne({
                                userId: find_ref2._id,
                              });
                            if (find_paymentref2) {
                              const update_ref2payment =
                                await referral_walletModel.findOneAndUpdate(
                                  { userId: find_ref2._id },
                                  {
                                    total_amount:
                                      parseFloat(find_paymentref2.total_amount) +
                                      parseFloat(four_refer),
                                  },
                                  { new: true }
                                );
                              if (find_ref2.refered_by) {
                                const find_ref3 = await userModel.findOne({
                                  referal_id: find_ref2.refered_by,
                                });
                                if (find_ref3) {
                                  const find_paymentref3 =
                                    await referral_walletModel.findOne({
                                      userId: find_ref3._id,
                                    });
                                  if (find_paymentref3) {
                                    const update_ref3payment =
                                      await referral_walletModel.findOneAndUpdate(
                                        { userId: find_ref3._id },
                                        {
                                          total_amount:
                                            parseFloat(
                                              find_paymentref3.total_amount
                                            ) + parseFloat(three_refer),
                                        },
                                        { new: true }
                                      );
                                    if (find_ref3.refered_by) {
                                      const find_ref4 = await userModel.findOne({
                                        referal_id: find_ref3.refered_by,
                                      });
                                      if (find_ref4) {
                                        const find_paymentref4 =
                                          await referral_walletModel.findOne({
                                            userId: find_ref4._id,
                                          });
                                        if (find_paymentref4) {
                                          const update_ref4payment =
                                            await referral_walletModel.findOneAndUpdate(
                                              { userId: find_ref4._id },
                                              {
                                                total_amount:
                                                  parseFloat(
                                                    find_paymentref4.total_amount
                                                  ) + parseFloat(two_refer),
                                              },
                                              { new: true }
                                            );
                                          if (find_ref4.refered_by) {
                                            const find_ref5 = await userModel.findOne(
                                              { referal_id: find_ref4.refered_by }
                                            );
                                            if (find_ref5) {
                                              const find_paymentref5 =
                                                await referral_walletModel.findOne({
                                                  userId: find_ref5._id,
                                                });
                                              if (find_paymentref5) {
                                                const update_ref5payment =
                                                  await referral_walletModel.findOneAndUpdate(
                                                    { userId: find_ref5._id },
                                                    {
                                                      total_amount:
                                                        parseFloat(
                                                          find_paymentref5.total_amount
                                                        ) + last_refer,
                                                    },
                                                    { new: true }
                                                  );
                                                if (update_ref5payment) {
                                                    res.status(200).send({
                                                        data: create_log,
                                                        message: "payment log created",
                                                        status: 1,
                                                        error: null,
                                                      });
                                                }
                                              } else {
                                                res.status(200).send({
                                                    data: create_log,
                                                    message: "payment log created",
                                                    status: 1,
                                                    error: null,
                                                  });
                                              }
                                            } else {
                                                res.status(200).send({
                                                    data: create_log,
                                                    message: "payment log created",
                                                    status: 1,
                                                    error: null,
                                                  });
                                            }
                                          } else {
                                            res.status(200).send({
                                                data: create_log,
                                                message: "payment log created",
                                                status: 1,
                                                error: null,
                                              });
                                          }
                                        } else {
                                            res.status(200).send({
                                                data: create_log,
                                                message: "payment log created",
                                                status: 1,
                                                error: null,
                                              });
                                        }
                                      } else {
                                        res.status(200).send({
                                            data: create_log,
                                            message: "payment log created",
                                            status: 1,
                                            error: null,
                                          });
                                      }
                                    } else {
                                        res.status(200).send({
                                            data: create_log,
                                            message: "payment log created",
                                            status: 1,
                                            error: null,
                                          });
                                    }
                                  } else {
                                    res.status(200).send({
                                        data: create_log,
                                        message: "payment log created",
                                        status: 1,
                                        error: null,
                                      });
                                  }
                                } else {
                                    res.status(200).send({
                                        data: create_log,
                                        message: "payment log created",
                                        status: 1,
                                        error: null,
                                      });
                                }
                              } else {
                                res.status(200).send({
                                    data: create_log,
                                    message: "payment log created",
                                    status: 1,
                                    error: null,
                                  });
                              }
                            } else {
                              const schemaref2 = new referral_walletModel();
                              schemaref2.userId = find_ref2._id;
                              schemaref2.total_amount = parseFloat(four_refer);
                              const add_ref2 = await referral_walletModel.create(
                                schemaref2
                              );
                              res.status(200).send({
                                data: create_log,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            res.status(200).send({
                                data: create_log,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                          }
                        } else {
                            res.status(200).send({
                                data: create_log,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                        }
                      } else {
                        res.status(200).send({
                            data: create_log,
                            message: "payment log created",
                            status: 1,
                            error: null,
                          });
                      }
                    } else {
                        res.status(200).send({
                            data: create_log,
                            message: "payment log created",
                            status: 1,
                            error: null,
                          });
                    }
                  } else {
                    res.status(200).send({
                        data: create_log,
                        message: "payment log created",
                        status: 1,
                        error: null,
                      });
                  }
                } else {
                  res.status(200).send({
                    data: deposit_log,
                    message: "error in deposit",
                    status: 0,
                  });
                }

              }

            }
            else{
                res.status(200).send({
                    data: create_log,
                    message: "deposit failed",
                    status: 0,
                    error: null,
                  });
            }
      } else {
        res.status(200).send({
          data: null,
          message: "user not found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "error in payment log",
        status: 0,
      });
    }
  },

  async deposit_reinvest(req, res, next) {
    try {
      const find_user = await userModel.findOne({ _id: req.body.UserId });
      if(!req.body.percentage){
         res.status(200).send({
          data:null,
          message:"update your app",
          status:0
        })
      }
      if(find_user.vip_user){
        
        const find_referral_earnings = await referral_walletModel.findOne({ userId: req.body.UserId });
        
       
        console.log(find_referral_earnings, "find_referral_earnings");
        

        const total_withdrawal =  parseFloat(find_referral_earnings.total_amount);
        console.log(total_withdrawal, "total_withdrawal");
        const total_amount = req.body.amount;
        const percentage = req.body.percentage;
        var bonus = 0
       if(percentage == 50){
          bonus = 2
        }else if(percentage == 100){
          bonus = 5
        }
        const final_deposit = (total_withdrawal * percentage) / 100;
        console.log(final_deposit, "data");
        const bonus_add = (final_deposit * bonus)/100;
        console.log(bonus_add,"bonus for percent")
        
        const value_referral = find_referral_earnings.total_amount - (find_referral_earnings.total_amount * percentage) / 100;
        
       
        console.log(value_referral, "value_referral");
       
        
        const update_referral_wallet = await referral_walletModel.findOneAndUpdate({ userId: req.body.UserId },{ total_amount: value_referral },{ new: true });
        
        
        console.log(update_referral_wallet, "update_referral_wallet");
        
        const random_number1 = otpGenerator.generate(5, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false,});
        const price = await axios.get( "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b");
        console.log(price.data.pairs[0].priceUsd, "prices");
        const GGO_usd = price.data.pairs[0].priceUsd;
        const currency_value = 77.96;
        console.log(currency_value, "currency_value");
        const GGO_inr = parseFloat(currency_value * GGO_usd);
        console.log(GGO_inr, "GGO_inr");
        const total_ggo = final_deposit / GGO_inr;
        console.log(total_ggo, "total_ggo");
        const bonus_crypto = bonus_add / GGO_inr;
        console.log(bonus_crypto,"bonus_crypto")
        console.log(req.body.UserId, "userId");
        const random_number = otpGenerator.generate(20, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: true });
        const OrderId = "order_" + random_number;
        const transaction_id = otpGenerator.generate(6, { upperCaseAlphabets: false,specialChars: false, lowerCaseAlphabets: false });
        const find_payment = await paymentModel.findOne({userId: req.body.UserId});
        const schema = new deposit_logModel();
        schema.userId = req.body.UserId;
        schema.crypto = parseFloat(total_ggo)+parseFloat(bonus_crypto);
        schema.holding_price = GGO_inr;
        schema.staking_id = random_number1;
        schema.orderId = OrderId;
        schema.amount = parseFloat(final_deposit)+parseFloat(bonus_add);
        schema.paymentCompleted = true;
        schema.currencyType = "INR";
        schema.paymentType = "Reinvest";
        schema.status = "Success";
        schema.previous_transaction = find_payment.total_amount
        schema.percentage = percentage
        const deposit_log = await deposit_logModel.create(schema);
        console.log(deposit_log, "deposit");
        
        
        const referral_schema = new referral_withdraw_logModel()
        referral_schema.userId = req.body.UserId
        referral_schema.amount = (find_referral_earnings.total_amount * percentage) / 100;
        referral_schema.percentage = percentage
        referral_schema.reinvest_id = deposit_log._id
        referral_schema.wallet_type = req.body.wallet_type
        const create_referral_log = await referral_withdraw_logModel.create(referral_schema);
        
        let date_d = new Date(deposit_log.createdAt)
        let month_d = date_d.getMonth();
        let year_d = date_d.getFullYear();
        const find_depositreport = await deposit_reportsModel.findOne({userId:find_user._id,month:month_d+1,year:year_d}).lean();
        if(find_depositreport){
          const update_depositreport = await deposit_reportsModel.findOneAndUpdate({_id:find_depositreport._id},{
            admin_deposit: parseFloat(find_depositreport.reinvest_amount) + parseFloat(deposit_log.amount)
          },{new:true})
          console.log(update_depositreport,"update_depositreport")
        }else{
          const schema = new deposit_reportsModel()
          schema.userId= find_user._id
          schema.ggoWallet = 0
          schema.reinvest_amount =  deposit_log.amount
          schema.admin_deposit = 0
          schema.month = month_d+1
          schema.year = year_d
          schema.referralId = find_user.referal_id
          schema.referralBy = find_user.refered_by
          schema.sharedRewards = 0
          schema.rewardsharecrypto = 0
          schema.save()
        }
        // checking interest
        var weekly_pr;
        var annual_pr;
        var monthly_pr;
    
        if (final_deposit <= 10000) {
          weekly_pr = 0.339;
          annual_pr = 17.65;
          monthly_pr = 1.358;
        } else if (final_deposit <= 20000) {
          weekly_pr = 0.341;
          annual_pr = 17.75;
          monthly_pr = 1.365;
        } else if (final_deposit <= 30000) {
          weekly_pr = 0.343;
          annual_pr = 17.85;
          monthly_pr = 1.373;
        } else if (final_deposit <= 40000) {
          weekly_pr = 0.345;
          annual_pr = 17.95;
          monthly_pr = 1.381;
        } else if (final_deposit <= 50000) {
          weekly_pr = 0.347;
          annual_pr = 18.05;
          monthly_pr = 1.388;
        } else if (final_deposit <= 60000) {
          weekly_pr = 0.349;
          annual_pr = 18.15;
          monthly_pr = 1.396;
        } else if (final_deposit <= 70000) {
          weekly_pr = 0.351;
          annual_pr = 18.25;
          monthly_pr = 1.404;
        } else if (final_deposit <= 80000) {
          weekly_pr = 0.353;
          annual_pr = 18.35;
          monthly_pr = 1.412;
        } else if (final_deposit <= 90000) {
          weekly_pr = 0.355;
          annual_pr = 18.45;
          monthly_pr = 1.419;
        } else if (final_deposit <= 100000) {
          weekly_pr = 0.357;
          annual_pr = 18.55;
          monthly_pr = 1.427;
        } else if (final_deposit <= 110000) {
          weekly_pr = 0.359;
          annual_pr = 18.65;
          monthly_pr = 1.435;
        } else if (final_deposit <= 120000) {
          weekly_pr = 0.361;
          annual_pr = 18.75;
          monthly_pr = 1.442;
        } else if (final_deposit <= 130000) {
          weekly_pr = 0.363;
          annual_pr = 18.85;
          monthly_pr = 1.450;
        } else if (final_deposit <= 140000) {
          weekly_pr = 0.364;
          annual_pr = 18.95;
          monthly_pr = 1.458;
        } else if (final_deposit <= 150000) {
          weekly_pr = 0.366;
          annual_pr = 19.05;
          monthly_pr = 1.465;
        } else if (final_deposit <= 160000) {
          weekly_pr = 0.368;
          annual_pr = 19.15;
          monthly_pr = 1.473;
        } else if (final_deposit <= 170000) {
          weekly_pr = 0.370;
          annual_pr = 19.25;
          monthly_pr = 1.481;
        } else if (final_deposit <= 180000) {
          weekly_pr = 0.372;
          annual_pr = 19.35;
          monthly_pr = 1.488;
        } else if (final_deposit <= 190000) {
          weekly_pr = 0.374;
          annual_pr = 19.45;
          monthly_pr = 1.496;
        } else if (final_deposit <= 200000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
        } else if (final_deposit <= 210000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
        } else if (final_deposit <= 220000) {
          weekly_pr = 0.380;
          annual_pr = 19.75;
          monthly_pr = 1.519;
        } else if (final_deposit <= 230000) {
          weekly_pr = 0.382;
          annual_pr = 19.85;
          monthly_pr = 1.527;
        } else if (final_deposit <= 240000) {
          weekly_pr = 0.384;
          annual_pr = 19.95;
          monthly_pr = 1.535;
        } else if (final_deposit <= 250000) {
          weekly_pr = 0.386;
          annual_pr = 20.05;
          monthly_pr = 1.542;
        } else if (final_deposit <= 260000) {
          weekly_pr = 0.388;
          annual_pr = 20.15;
          monthly_pr = 1.550;
        } else if (final_deposit <= 270000) {
          weekly_pr = 0.389;
          annual_pr = 20.25;
          monthly_pr = 1.558;
        } else if (final_deposit <= 280000) {
          weekly_pr = 0.391;
          annual_pr = 20.35;
          monthly_pr = 1.565;
        } else if (final_deposit <= 290000) {
          weekly_pr = 0.393;
          annual_pr = 20.45;
          monthly_pr = 1.573;
        } else if (final_deposit <= 300000) {
          weekly_pr = 0.395;
          annual_pr = 20.55;
          monthly_pr = 1.581;
        } else if (final_deposit <= 310000) {
          weekly_pr = 0.397;
          annual_pr = 20.65;
          monthly_pr = 1.588;
        } else if (final_deposit <= 320000) {
          weekly_pr = 0.399;
          annual_pr = 20.75;
          monthly_pr = 1.596;
        } else if (final_deposit <= 330000) {
          weekly_pr = 0.401;
          annual_pr = 20.85;
          monthly_pr = 1.604;
        } else if (final_deposit <= 340000) {
          weekly_pr = 0.403;
          annual_pr = 20.95;
          monthly_pr = 1.612;
        } else if (final_deposit <= 350000) {
          weekly_pr = 0.405;
          annual_pr = 21.05;
          monthly_pr = 1.619;
        } else if (final_deposit <= 360000) {
          weekly_pr = 0.407;
          annual_pr = 21.15;
          monthly_pr = 1.627;
        } else if (final_deposit <= 370000) {
          weekly_pr = 0.409;
          annual_pr = 21.25;
          monthly_pr = 1.635;
        } else if (final_deposit <= 380000) {
          weekly_pr = 0.411;
          annual_pr = 21.35;
          monthly_pr = 1.642;
        } else if (final_deposit <= 390000) {
          weekly_pr = 0.413;
          annual_pr = 21.45;
          monthly_pr = 1.650;
        } else if (final_deposit <= 400000) {
          weekly_pr = 0.414;
          annual_pr = 21.55;
          monthly_pr = 1.658;
        } else if (final_deposit <= 410000) {
          weekly_pr = 0.416;
          annual_pr = 21.65;
          monthly_pr = 1.665;
        } else if (final_deposit <= 420000) {
          weekly_pr = 0.418;
          annual_pr = 21.75;
          monthly_pr = 1.673;
        } else if (final_deposit <= 430000) {
          weekly_pr = 0.420;
          annual_pr = 21.85;
          monthly_pr = 1.681;
        } else if (final_deposit <= 440000) {
          weekly_pr = 0.422;
          annual_pr = 21.95;
          monthly_pr = 1.688;
        } else if (final_deposit <= 450000) {
          weekly_pr = 0.424;
          annual_pr = 22.05;
          monthly_pr = 1.696;
        } else if (final_deposit <= 460000) {
          weekly_pr = 0.426;
          annual_pr = 22.15;
          monthly_pr = 1.704;
        } else if (final_deposit <= 470000) {
          weekly_pr = 0.428;
          annual_pr = 22.25;
          monthly_pr = 1.712;
        } else if (final_deposit <= 480000) {
          weekly_pr = 0.430;
          annual_pr = 22.35;
          monthly_pr = 1.719;
        } else if (final_deposit <= 490000) {
          weekly_pr = 0.432;
          annual_pr = 22.45;
          monthly_pr = 1.727;
        } else if (final_deposit <= 500000) {
          weekly_pr = 0.434;
          annual_pr = 22.55;
          monthly_pr = 1.735;
        } else if (final_deposit <= 600000) {
          weekly_pr = 0.436;
          annual_pr = 22.65;
          monthly_pr = 1.742;
        } else if (final_deposit <= 700000) {
          weekly_pr = 0.438;
          annual_pr = 22.75;
          monthly_pr = 1.750;
        } else if (final_deposit <= 800000) {
          weekly_pr = 0.439;
          annual_pr = 22.85;
          monthly_pr = 1.758;
        } else if (final_deposit <= 900000) {
          weekly_pr = 0.441;
          annual_pr = 22.95;
          monthly_pr = 1.765;
        } else if (final_deposit <= 1000000) {
          weekly_pr = 0.445;
          annual_pr = 23.15;
          monthly_pr = 1.781;
        } else if (final_deposit <= 1500000) {
          weekly_pr = 0.447;
          annual_pr = 23.25;
          monthly_pr = 1.788;
        } else if (final_deposit <= 2000000) {
          weekly_pr = 0.449;
          annual_pr = 23.35;
          monthly_pr = 1.796;
        } else if (final_deposit <= 2500000) {
          weekly_pr = 0.451;
          annual_pr = 23.45;
          monthly_pr = 1.804;
        } else if (final_deposit <= 3000000) {
          weekly_pr = 0.453;
          annual_pr = 23.55;
          monthly_pr = 1.812;
        } else if (final_deposit <= 3500000) {
          weekly_pr = 0.455;
          annual_pr = 23.65;
          monthly_pr = 1.819;
        } else if (final_deposit <= 4000000) {
          weekly_pr = 0.457;
          annual_pr = 23.75;
          monthly_pr = 1.827;
        } else if (final_deposit <= 4500000) {
          weekly_pr = 0.459;
          annual_pr = 23.65;
          monthly_pr = 1.835;
        }else if (final_deposit <= 5100000) {
          weekly_pr = 0.462;
          annual_pr = 23.55;
          monthly_pr = 1.846;
        }

        const weekly_payout = (weekly_pr * final_deposit) / 100;
        const monthly_payout = (monthly_pr * final_deposit) / 100;
        const annual_payout = (annual_pr * final_deposit) / 100;
        // end checking interest

        // interest adding
        const d = new Date();
        let day = d.getDay();
        let month = d.getMonth();
        let date = d.getDate();
        let hour = d.getHours();
        let min = d.getMinutes();
        // if (req.body.interest_type == "weekly") {
        //   console.log(deposit_log.userId, "id");
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = deposit_log.userId;
        //   schema1.deposit_id = deposit_log._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = deposit_log.staking_id;
        //   schema1.intrest_amount = parseFloat(weekly_payout);
        //   schema1.amount = final_deposit;
        //   schema1.status = true;
        //   schema1.interest_percentage = weekly_pr;
        //   schema1.day = day;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "weekly";
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "create_history");
        //   schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
        //     const schema = new interest_logModel();
        //     schema.UserId = deposit_log.userId;
        //     schema.interest_amount = parseFloat(weekly_payout);
        //     schema.status = "success";
        //     schema.payment_completed = true;
        //     schema.intrest_type = "weekly";
        //     schema.hours = hour;
        //     schema.day = day;
        //     schema.minute = min;
        //     const create_interest = await interest_logModel.create(schema);
        //     const find_interest_wallet = await interest_walletModel.findOne({
        //       UserId: deposit_log.userId,
        //     });
        //     if (find_interest_wallet) {
        //       const update_interest_wallet =
        //         await interest_walletModel.findOneAndUpdate(
        //           { UserId: deposit_log.userId },
        //           {
        //             total_amount:
        //               parseFloat(find_interest_wallet.total_amount) +
        //               parseFloat(weekly_payout),
        //           },
        //           { new: true }
        //         );
        //     } else {
        //       const schema1 = new interest_walletModel();
        //       schema1.UserId = deposit_log.userId;
        //       schema1.total_amount = parseFloat(weekly_payout);
        //       const create_interest_wallet = await interest_walletModel.create(
        //         schema1
        //       );
        //     }
        //   });
        // } 
        // if (req.body.interest_type == "monthly") {
          const schema1 = new intrest_historyModel();
          schema1.UserId = deposit_log.userId;
          schema1.deposit_id = deposit_log._id;
          schema1.transaction_id = transaction_id;
          schema1.staking_id = deposit_log.staking_id;
          schema1.intrest_amount = parseFloat(monthly_payout);
          schema1.amount = final_deposit;
          schema1.status = true;
          schema1.interest_percentage = monthly_pr;
          schema1.date = date;
          schema1.hours = hour;
          schema1.minute = min;
          schema1.interest_type = "monthly";
          schema1.wallet_type = req.body.wallet_type;
          const create_history = await intrest_historyModel.create(schema1);
          console.log(create_history, "create_history");
          schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
            const schema = new interest_logModel();
            schema.UserId = deposit_log.userId;
            schema.interest_amount = parseFloat(monthly_payout);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "monthly";
            schema.hours = hour;
            schema.date = date;
            schema.minute = min;
            schema.wallet_type = req.body.wallet_type;
            const create_interest = await interest_logModel.create(schema);
            const find_interest_wallet = await interest_walletModel.findOne({ UserId: deposit_log.userId,});
            if (find_interest_wallet) {
              const update_interest_wallet = await interest_walletModel.findOneAndUpdate({ UserId: deposit_log.userId },
              { total_amount:
                parseFloat(find_interest_wallet.total_amount) +
                parseFloat(monthly_payout),
              },{ new: true });
            } else {
              const schema1 = new interest_walletModel();
              schema1.UserId = deposit_log.userId;
              schema1.total_amount = parseFloat(monthly_payout);
              const create_interest_wallet = await interest_walletModel.create(schema1);
            }
          });
        // } 
        // else if (req.body.interest_type == "yearly") {
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = deposit_log.userId;
        //   schema1.deposit_id = deposit_log._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = deposit_log.staking_id;
        //   schema1.intrest_amount = parseFloat(annual_payout);
        //   schema1.amount = final_deposit;
        //   schema1.status = true;
        //   schema1.interest_percentage = annual_pr;
        //   schema1.month = month;
        //   schema1.date = date;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "yearly";
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "create_history");
        //   schedule.scheduleJob(
        //     `${min} ${hour} ${date} ${month + 1} *`,
        //     async () => {
        //       const schema = new interest_logModel();
        //       schema.UserId = deposit_log.userId;
        //       schema.interest_amount = parseFloat(annual_payout);
        //       schema.status = "success";
        //       schema.payment_completed = true;
        //       schema.intrest_type = "yearly";
        //       schema.hours = hour;
        //       schema.date = date;
        //       schema.month = month + 1;
        //       schema.minute = min;
        //       const create_interest = await interest_logModel.create(schema);
        //       const find_interest_wallet = await interest_walletModel.findOne({
        //         UserId: deposit_log.userId,
        //       });
        //       if (find_interest_wallet) {
        //         const update_interest_wallet =
        //           await interest_walletModel.findOneAndUpdate(
        //             { UserId: deposit_log.userId },
        //             {
        //               total_amount:
        //                 parseFloat(find_interest_wallet.total_amount) +
        //                 parseFloat(annual_payout),
        //             },
        //             { new: true }
        //           );
        //       } else {
        //         const schema1 = new interest_walletModel();
        //         schema1.UserId = deposit_log.userId;
        //         schema1.total_amount = parseFloat(annual_payout);
        //         const create_interest_wallet = await interest_walletModel.create(
        //           schema1
        //         );
        //       }
        //     }
        //   );
        // } ,
        // else {
        //   return res.status(200).send({
        //     data: null,
        //     message: "wrong Interest type2",
        //     status: 0,
        //   });
        // }
        // ending interest adding

        if (find_payment) {
          const update_payment = await paymentModel.findOneAndUpdate({ userId: req.body.UserId },
          { total_amount:
            parseFloat(find_payment.total_amount) + parseFloat(final_deposit)+parseFloat(bonus_add),
            crypto: parseFloat(find_payment.crypto) + parseFloat(total_ggo)+parseFloat(bonus_crypto),
          },{ new: true });
          console.log(update_payment,"update_payment")
          if (find_user.refered_by) {
            const find_refuser = await userModel.findOne({ referal_id: find_user.refered_by});
            if (find_refuser) {
              if(find_refuser._id == '633ac010ff0962794cc9851d' || find_refuser._id == '635b651591a2d6ba72072375' || find_refuser._id == "6389f8aae953e34e89e5b411"){
                const one_refer = (parseInt(final_deposit) * 12.5) / 100;
              const four_refer = (parseInt(final_deposit) * 1) / 100;
              const three_refer = (parseInt(final_deposit) * 1) / 100;
              const last_refer = (parseInt(final_deposit) * 1) / 100;
              const two_refer = (parseInt(final_deposit) * 1) / 100;
              const  remaining_refer = (parseInt(final_deposit)*1)/100;
              console.log(one_refer, "5%ref");
              console.log(two_refer, "2%ref");
              const find_refpayment = await referral_walletModel.findOne({
                userId: find_refuser._id,
              });
              if (find_refpayment) {
                if(find_refuser.Addreferral){
                const update_refpayment =
                  await referral_walletModel.findOneAndUpdate(
                    { userId: find_refuser._id },
                    {
                      total_amount:
                        parseFloat(find_refpayment.total_amount) +
                        parseFloat(one_refer),
                    },
                    { new: true }
                  );
                  const schema1 = new referrals_logModel()
                  schema1.amount = parseFloat(one_refer)
                  schema1.userId = find_refuser._id
                  schema1.level = "l1"
                  schema1.addedBy = find_user._id
                  schema1.save()
                }
                if (find_refuser.refered_by) {
                  const find_ref2 = await userModel.findOne({
                    referal_id: find_refuser.refered_by,
                  });
                  if (find_ref2) {
                    const find_paymentref2 = await referral_walletModel.findOne({
                      userId: find_ref2._id,
                    });
                    if (find_paymentref2) {
                      if(find_ref2.Addreferral){
                      const update_ref2payment =
                        await referral_walletModel.findOneAndUpdate(
                          { userId: find_ref2._id },
                          {
                            total_amount:
                              parseFloat(find_paymentref2.total_amount) +
                              parseFloat(four_refer),
                          },
                          { new: true }
                        );
                        const schema2 = new referrals_logModel()
                        schema2.amount = parseFloat(four_refer)
                        schema2.userId = find_ref2._id
                        schema2.level = "l2"
                        schema2.addedBy = find_user._id
                        schema2.save()
                      }
                      if (find_ref2.refered_by) {
                        const find_ref3 = await userModel.findOne({
                          referal_id: find_ref2.refered_by,
                        });
                        if (find_ref3) {
                          const find_paymentref3 =
                            await referral_walletModel.findOne({
                              userId: find_ref3._id,
                            });
                          if (find_paymentref3) {
                            if(find_ref3.Addreferral){
                            const update_ref3payment =
                              await referral_walletModel.findOneAndUpdate(
                                { userId: find_ref3._id },
                                {
                                  total_amount:
                                    parseFloat(find_paymentref3.total_amount) +
                                    parseFloat(three_refer),
                                },
                                { new: true }
                              );
                              const schema3 = new referrals_logModel()
                              schema3.amount = parseFloat(three_refer)
                              schema3.userId = find_ref3._id
                              schema3.level = "l3"
                              schema3.addedBy = find_user._id
                              schema3.save()
                            }
                            if (find_ref3.refered_by) {
                              const find_ref4 = await userModel.findOne({
                                referal_id: find_ref3.refered_by,
                              });
                              if (find_ref4) {
                                const find_paymentref4 =
                                  await referral_walletModel.findOne({
                                    userId: find_ref4._id,
                                  });
                                if (find_paymentref4) {
                                  if(find_ref4.Addreferral){
                                  const update_ref4payment =
                                    await referral_walletModel.findOneAndUpdate(
                                      { userId: find_ref4._id },
                                      {
                                        total_amount:
                                          parseFloat(
                                            find_paymentref4.total_amount
                                          ) + parseFloat(two_refer),
                                      },
                                      { new: true }
                                    );
                                    const schema4 = new referrals_logModel()
                                    schema4.amount = parseFloat(two_refer)
                                    schema4.userId = find_ref4._id
                                    schema4.level = "l4"
                                    schema4.addedBy = find_user._id
                                    schema4.save()
                                  }
                                  if (find_ref4.refered_by) {
                                    const find_ref5 = await userModel.findOne({
                                      referal_id: find_ref4.refered_by,
                                    });
                                    if (find_ref5) {
                                      const find_paymentref5 =
                                        await referral_walletModel.findOne({
                                          userId: find_ref5._id,
                                        });
                                      if (find_paymentref5) {
                                        if(find_ref5.Addreferral){
                                        const update_ref5payment =
                                          await referral_walletModel.findOneAndUpdate(
                                            { userId: find_ref5._id },
                                            {
                                              total_amount:
                                                parseFloat(
                                                  find_paymentref5.total_amount
                                                ) + last_refer,
                                            },
                                            { new: true }
                                          );
                                          const schema5 = new referrals_logModel()
                                          schema5.amount = parseFloat(last_refer)
                                          schema5.userId = find_ref5._id
                                          schema5.level = "l5"
                                          schema5.addedBy = find_user._id
                                          schema5.save()
                                        }
                                          if(find_ref5.refered_by){
                                            const find_ref6 = await userModel.findOne({referal_id: find_ref5.refered_by});
                                            if(find_ref6){
                                              const find_paymentref6 = await referral_walletModel.findOne({userId: find_ref6._id});
                                              if(find_paymentref6){
                                                if(find_ref6.Addreferral){
                                                const update_ref6payment = await referral_walletModel.findOneAndUpdate(
                                                  { userId: find_ref6._id },
                                                   {total_amount: parseFloat( find_paymentref6.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                   const schema6 = new referrals_logModel()
                                                    schema6.amount = parseFloat(remaining_refer)
                                                    schema6.userId = find_ref6._id
                                                    schema6.level = "l6"
                                                    schema6.addedBy = find_user._id
                                                    schema6.save()
                                                }
                                                    if(find_ref6.refered_by){
                                                      const find_ref7 = await userModel.findOne({referal_id: find_ref6.refered_by});
                                                      if(find_ref7){
                                                        const find_paymentref7 = await referral_walletModel.findOne({userId: find_ref7._id});
                                                        if(find_paymentref7){
                                                          if(find_ref7.Addreferral){
                                                          const update_ref7payment = await referral_walletModel.findOneAndUpdate(
                                                            { userId: find_ref7._id },
                                                             {total_amount: parseFloat( find_paymentref7.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                             const schema7 = new referrals_logModel()
                                                              schema7.amount = parseFloat(remaining_refer)
                                                              schema7.userId = find_ref7._id
                                                              schema7.level = "l7"
                                                              schema7.addedBy = find_user._id
                                                              schema7.save()
                                                          }
                                                              if(find_ref7.refered_by){
                                                                const find_ref8 = await userModel.findOne({referal_id: find_ref7.refered_by});
                                                                if(find_ref8){
                                                                  const find_paymentref8 = await referral_walletModel.findOne({userId: find_ref8._id});
                                                                  if(find_paymentref8){
                                                                    if(find_ref8.Addreferral){
                                                                    const update_ref8payment = await referral_walletModel.findOneAndUpdate(
                                                                      { userId: find_ref8._id },
                                                                       {total_amount: parseFloat( find_paymentref8.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                       const schema8 = new referrals_logModel()
                                                                        schema8.amount = parseFloat(remaining_refer)
                                                                        schema8.userId = find_ref8._id
                                                                        schema8.level = "l8"
                                                                        schema8.addedBy = find_user._id
                                                                        schema8.save()
                                                                    }
                                                                        if(find_ref8.refered_by){
                                                                          const find_ref9 = await userModel.findOne({referal_id: find_ref8.refered_by});
                                                                          if(find_ref9){
                                                                            const find_paymentref9 = await referral_walletModel.findOne({userId: find_ref9._id});
                                                                            if(find_paymentref9){
                                                                              if(find_ref9.Addreferral){
                                                                              const update_ref9payment = await referral_walletModel.findOneAndUpdate(
                                                                                { userId: find_ref9._id },
                                                                                 {total_amount: parseFloat( find_paymentref9.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                 const schema9 = new referrals_logModel()
                                                                                  schema9.amount = parseFloat(remaining_refer)
                                                                                  schema9.userId = find_ref9._id
                                                                                  schema9.level = "l9"
                                                                                  schema9.addedBy = find_user._id
                                                                                  schema9.save()
                                                                              }
                                                                                  if(find_ref9.refered_by){
                                                                                    const find_ref10 = await userModel.findOne({referal_id: find_ref9.refered_by});
                                                                                    if(find_ref10){
                                                                                      const find_paymentref10 = await referral_walletModel.findOne({userId: find_ref10._id});
                                                                                      if(find_paymentref10){
                                                                                        if(find_ref10.Addreferral){
                                                                                        const update_ref10payment = await referral_walletModel.findOneAndUpdate(
                                                                                          { userId: find_ref10._id },
                                                                                           {total_amount: parseFloat( find_paymentref10.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                           const schema10 = new referrals_logModel()
                                                                                            schema10.amount = parseFloat(remaining_refer)
                                                                                            schema10.userId = find_ref10._id
                                                                                            schema10.level = "l10"
                                                                                            schema10.addedBy = find_user._id
                                                                                            schema10.save()
                                                                                        }
                                                                                            if(find_ref10.refered_by){
                                                                                              const find_ref11 = await userModel.findOne({referal_id: find_ref10.refered_by});
                                                                                              if(find_ref11){
                                                                                                const find_paymentref11 = await referral_walletModel.findOne({userId: find_ref11._id});
                                                                                                if(find_paymentref11){
                                                                                                  if(find_ref11.Addreferral){
                                                                                                  const update_ref11payment = await referral_walletModel.findOneAndUpdate(
                                                                                                    { userId: find_ref11._id },
                                                                                                     {total_amount: parseFloat( find_paymentref11.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                     const schema11 = new referrals_logModel()
                                                                                                      schema11.amount = parseFloat(remaining_refer)
                                                                                                      schema11.userId = find_ref11._id
                                                                                                      schema11.level = "l11"
                                                                                                      schema11.addedBy = find_user._id
                                                                                                      schema11.save()
                                                                                                  }
                                                                                                      if(find_ref11.refered_by){
                                                                                                        const find_ref12 = await userModel.findOne({referal_id: find_ref11.refered_by});
                                                                                                        if(find_ref12){
                                                                                                          const find_paymentref12 = await referral_walletModel.findOne({userId: find_ref12._id});
                                                                                                          if(find_paymentref12){
                                                                                                            if(find_ref12.Addreferral){
                                                                                                            const update_ref12payment = await referral_walletModel.findOneAndUpdate(
                                                                                                              { userId: find_ref12._id },
                                                                                                               {total_amount: parseFloat( find_paymentref12.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                               const schema12 = new referrals_logModel()
                                                                                                                schema12.amount = parseFloat(remaining_refer)
                                                                                                                schema12.userId = find_ref12._id
                                                                                                                schema12.level = "l12"
                                                                                                                schema12.addedBy = find_user._id
                                                                                                                schema12.save()
                                                                                                            }
                                                                                                                if(find_ref12.refered_by){
                                                                                                                  const find_ref13 = await userModel.findOne({referal_id: find_ref12.refered_by});
                                                                                                                  if(find_ref13){
                                                                                                                    const find_paymentref13 = await referral_walletModel.findOne({userId: find_ref13._id});
                                                                                                                    if(find_paymentref13){
                                                                                                                      if(find_ref13.Addreferral){
                                                                                                                      const update_ref13payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                        { userId: find_ref13._id },
                                                                                                                         {total_amount: parseFloat( find_paymentref13.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                         const schema13 = new referrals_logModel()
                                                                                                                          schema13.amount = parseFloat(remaining_refer)
                                                                                                                          schema13.userId = find_ref13._id
                                                                                                                          schema13.level = "l13"
                                                                                                                          schema13.addedBy = find_user._id
                                                                                                                          schema13.save()
                                                                                                                      }
                                                                                                                          if(find_ref13.refered_by){
                                                                                                                            const find_ref14 = await userModel.findOne({referal_id: find_ref13.refered_by});
                                                                                                                            if(find_ref14){
                                                                                                                              const find_paymentref14 = await referral_walletModel.findOne({userId: find_ref14._id});
                                                                                                                              if(find_paymentref14){
                                                                                                                                if(find_ref14.Addreferral){
                                                                                                                                const update_ref14payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                  { userId: find_ref14._id },
                                                                                                                                   {total_amount: parseFloat( find_paymentref14.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                   const schema14 = new referrals_logModel()
                                                                                                                                    schema14.amount = parseFloat(remaining_refer)
                                                                                                                                    schema14.userId = find_ref14._id
                                                                                                                                    schema14.level = "l14"
                                                                                                                                    schema14.addedBy = find_user._id
                                                                                                                                    schema14.save()
                                                                                                                                }
                                                                                                                                    if(find_ref14.refered_by){
                                                                                                                                      const find_ref15 = await userModel.findOne({referal_id: find_ref14.refered_by});
                                                                                                                                      if(find_ref15){
                                                                                                                                        const find_paymentref15 = await referral_walletModel.findOne({userId: find_ref15._id});
                                                                                                                                        if(find_paymentref15){
                                                                                                                                          if(find_ref15.Addreferral){
                                                                                                                                          const update_ref15payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                            { userId: find_ref15._id },
                                                                                                                                             {total_amount: parseFloat( find_paymentref15.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                             const schema15 = new referrals_logModel()
                                                                                                                                              schema15.amount = parseFloat(remaining_refer)
                                                                                                                                              schema15.userId = find_ref15._id
                                                                                                                                              schema15.level = "l15"
                                                                                                                                              schema15.addedBy = find_user._id
                                                                                                                                              schema15.save()
  
                                                                                                                                          
                                                                                                                                              return res.status(200).send({
                                                                                                                                                data: deposit_log,
                                                                                                                                                message: "reinvest successful",
                                                                                                                                                status: 1,
                                                                                                                                                error: null,
                                                                                                                                              });
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                          return res.status(200).send({
                                                                                                                                            data: deposit_log,
                                                                                                                                            message: "reinvest successful",
                                                                                                                                            status: 1,
                                                                                                                                            error: null,
                                                                                                                                          });
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                      else {
                                                                                                                                        return res.status(200).send({
                                                                                                                                          data: deposit_log,
                                                                                                                                          message: "reinvest successful",
                                                                                                                                          status: 1,
                                                                                                                                          error: null,
                                                                                                                                        });
                                                                                                                                      }
                                                                                                                                     }
                                                                                                                                     else {
                                                                                                                                      return res.status(200).send({
                                                                                                                                        data: deposit_log,
                                                                                                                                        message: "reinvest successful",
                                                                                                                                        status: 1,
                                                                                                                                        error: null,
                                                                                                                                      });
                                                                                                                                    }
                                                                                                                              }
                                                                                                                              else {
                                                                                                                                return res.status(200).send({
                                                                                                                                  data: deposit_log,
                                                                                                                                  message: "reinvest successful",
                                                                                                                                  status: 1,
                                                                                                                                  error: null,
                                                                                                                                });
                                                                                                                              }
                                                                                                                            }
                                                                                                                            else {
                                                                                                                              return res.status(200).send({
                                                                                                                                data: deposit_log,
                                                                                                                                message: "reinvest successful",
                                                                                                                                status: 1,
                                                                                                                                error: null,
                                                                                                                              });
                                                                                                                            }
                                                                                                                           }
                                                                                                                           else {
                                                                                                                            return res.status(200).send({
                                                                                                                              data: deposit_log,
                                                                                                                              message: "reinvest successful",
                                                                                                                              status: 1,
                                                                                                                              error: null,
                                                                                                                            });
                                                                                                                          }
                                                                                                                    }
                                                                                                                    else {
                                                                                                                      return res.status(200).send({
                                                                                                                        data: deposit_log,
                                                                                                                        message: "reinvest successful",
                                                                                                                        status: 1,
                                                                                                                        error: null,
                                                                                                                      });
                                                                                                                    }
                                                                                                                  }
                                                                                                                  else {
                                                                                                                    return res.status(200).send({
                                                                                                                      data: deposit_log,
                                                                                                                      message: "reinvest successful",
                                                                                                                      status: 1,
                                                                                                                      error: null,
                                                                                                                    });
                                                                                                                  }
                                                                                                                 }
                                                                                                                 else {
                                                                                                                  return res.status(200).send({
                                                                                                                    data: deposit_log,
                                                                                                                    message: "reinvest successful",
                                                                                                                    status: 1,
                                                                                                                    error: null,
                                                                                                                  });
                                                                                                                }
                                                                                                          }
                                                                                                          else {
                                                                                                            return res.status(200).send({
                                                                                                              data: deposit_log,
                                                                                                              message: "reinvest successful",
                                                                                                              status: 1,
                                                                                                              error: null,
                                                                                                            });
                                                                                                          }
                                                                                                        }
                                                                                                        else {
                                                                                                          return res.status(200).send({
                                                                                                            data: deposit_log,
                                                                                                            message: "reinvest successful",
                                                                                                            status: 1,
                                                                                                            error: null,
                                                                                                          });
                                                                                                        }
                                                                                                       }
                                                                                                       else {
                                                                                                        return res.status(200).send({
                                                                                                          data: deposit_log,
                                                                                                          message: "reinvest successful",
                                                                                                          status: 1,
                                                                                                          error: null,
                                                                                                        });
                                                                                                      }
                                                                                                }
                                                                                                else {
                                                                                                  return res.status(200).send({
                                                                                                    data: deposit_log,
                                                                                                    message: "reinvest successful",
                                                                                                    status: 1,
                                                                                                    error: null,
                                                                                                  });
                                                                                                }
                                                                                              }
                                                                                              else {
                                                                                                return res.status(200).send({
                                                                                                  data: deposit_log,
                                                                                                  message: "reinvest successful",
                                                                                                  status: 1,
                                                                                                  error: null,
                                                                                                });
                                                                                              }
                                                                                             }
                                                                                             else {
                                                                                              return res.status(200).send({
                                                                                                data: deposit_log,
                                                                                                message: "reinvest successful",
                                                                                                status: 1,
                                                                                                error: null,
                                                                                              });
                                                                                            }
                                                                                      }
                                                                                      else {
                                                                                        return res.status(200).send({
                                                                                          data: deposit_log,
                                                                                          message: "reinvest successful",
                                                                                          status: 1,
                                                                                          error: null,
                                                                                        });
                                                                                      }
                                                                                    }
                                                                                    else {
                                                                                      return res.status(200).send({
                                                                                        data: deposit_log,
                                                                                        message: "reinvest successful",
                                                                                        status: 1,
                                                                                        error: null,
                                                                                      });
                                                                                    }
                                                                                   }
                                                                                   else {
                                                                                    return res.status(200).send({
                                                                                      data: deposit_log,
                                                                                      message: "reinvest successful",
                                                                                      status: 1,
                                                                                      error: null,
                                                                                    });
                                                                                  }
                                                                            }
                                                                            else {
                                                                              return res.status(200).send({
                                                                                data: deposit_log,
                                                                                message: "reinvest successful",
                                                                                status: 1,
                                                                                error: null,
                                                                              });
                                                                            }
                                                                          }
                                                                          else {
                                                                            return res.status(200).send({
                                                                              data: deposit_log,
                                                                              message: "reinvest successful",
                                                                              status: 1,
                                                                              error: null,
                                                                            });
                                                                          }
                                                                         }
                                                                         else {
                                                                          return res.status(200).send({
                                                                            data: deposit_log,
                                                                            message: "reinvest successful",
                                                                            status: 1,
                                                                            error: null,
                                                                          });
                                                                        }
                                                                  }
                                                                  else {
                                                                    return res.status(200).send({
                                                                      data: deposit_log,
                                                                      message: "reinvest successful",
                                                                      status: 1,
                                                                      error: null,
                                                                    });
                                                                  }
                                                                }
                                                                else {
                                                                  return res.status(200).send({
                                                                    data: deposit_log,
                                                                    message: "reinvest successful",
                                                                    status: 1,
                                                                    error: null,
                                                                  });
                                                                }
                                                               }
                                                               else {
                                                                return res.status(200).send({
                                                                  data: deposit_log,
                                                                  message: "reinvest successful",
                                                                  status: 1,
                                                                  error: null,
                                                                });
                                                              }
                                                        }
                                                        else {
                                                          return res.status(200).send({
                                                            data: deposit_log,
                                                            message: "reinvest successful",
                                                            status: 1,
                                                            error: null,
                                                          });
                                                        }
                                                      }
                                                      else {
                                                        return res.status(200).send({
                                                          data: deposit_log,
                                                          message: "reinvest successful",
                                                          status: 1,
                                                          error: null,
                                                        });
                                                      }
                                                     }
                                                     else {
                                                      return res.status(200).send({
                                                        data: deposit_log,
                                                        message: "reinvest successful",
                                                        status: 1,
                                                        error: null,
                                                      });
                                                    }
                                              }
                                              else {
                                                return res.status(200).send({
                                                  data: deposit_log,
                                                  message: "reinvest successful",
                                                  status: 1,
                                                  error: null,
                                                });
                                              }
                                            }
                                            else {
                                              return res.status(200).send({
                                                data: deposit_log,
                                                message: "reinvest successful",
                                                status: 1,
                                                error: null,
                                              });
                                            }
                                           }
                                           else {
                                            return res.status(200).send({
                                              data: deposit_log,
                                              message: "reinvest successful",
                                              status: 1,
                                              error: null,
                                            });
                                          }
                                      } else {
                                        return res.status(200).send({
                                          data: deposit_log,
                                          message: "reinvest successful",
                                          status: 1,
                                          error: null,
                                        });
                                      }
                                    } else {
                                      return res.status(200).send({
                                        data: deposit_log,
                                        message: "reinvest successful",
                                        status: 1,
                                        error: null,
                                      });
                                    }
                                  } else {
                                    return res.status(200).send({
                                      data: deposit_log,
                                      message: "reinvest successful",
                                      status: 1,
                                      error: null,
                                    });
                                  }
                                } else {
                                  return res.status(200).send({
                                    data: deposit_log,
                                    message: "reinvest successful",
                                    status: 1,
                                    error: null,
                                  });
                                }
                              } else {
                                return res.status(200).send({
                                  data: deposit_log,
                                  message: "reinvest successful",
                                  status: 1,
                                  error: null,
                                });
                              }
                            } else {
                              return res.status(200).send({
                                data: deposit_log,
                                message: "reinvest successful",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            return res.status(200).send({
                              data: deposit_log,
                              message: "reinvest successful",
                              status: 1,
                              error: null,
                            });
                          }
                        } else {
                          return res.status(200).send({
                            data: deposit_log,
                            message: "reinvest successful",
                            status: 1,
                            error: null,
                          });
                        }
                      } else {
                        return res.status(200).send({
                          data: deposit_log,
                          message: "reinvest successful",
                          status: 1,
                          error: null,
                        });
                      }
                    } else {
                      const schemaref2 = new referral_walletModel();
                      schemaref2.userId = find_ref2._id;
                      schemaref2.total_amount = parseFloat(four_refer);
                      const add_ref2 = await referral_walletModel.create(
                        schemaref2
                      );
                      return res.status(200).send({
                        data: deposit_log,
                        message: "reinvest successful",
                        status: 1,
                        error: null,
                      });
                    }
                  } else {
                    return res.status(200).send({
                      data: deposit_log,
                      message: "reinvest successful",
                      status: 1,
                      error: null,
                    });
                  }
                } else {
                  return res.status(200).send({
                    data: deposit_log,
                    message: "reinvest successful",
                    status: 1,
                    error: null,
                  });
                }
              } else {
                return res.status(200).send({
                  data: deposit_log,
                  message: "reinvest successful",
                  status: 1,
                  error: null,
                });
              }
              }else{
              const one_refer = (parseInt(final_deposit) * 5) / 100;
              const four_refer = (parseInt(final_deposit) * 4) / 100;
              const three_refer = (parseInt(final_deposit) * 3) / 100;
              const last_refer = (parseInt(final_deposit) * 1) / 100;
              const two_refer = (parseInt(final_deposit) * 2) / 100;
              const  remaining_refer = (parseInt(final_deposit)*0.25)/100;
              console.log(one_refer, "5%ref");
              console.log(two_refer, "2%ref");
              const find_refpayment = await referral_walletModel.findOne({userId: find_refuser._id});
              if (find_refpayment) {
                if(find_refuser.Addreferral){
                const update_refpayment = await referral_walletModel.findOneAndUpdate(
                  { userId: find_refuser._id },
                  { total_amount: parseFloat(find_refpayment.total_amount) + parseFloat(one_refer)},{ new: true });
                  const schema1 = new referrals_logModel()
                schema1.amount = parseFloat(one_refer)
                schema1.userId = find_refuser._id
                schema1.level = "l1"
                schema1.addedBy = find_user._id
                schema1.save()
                }
                if (find_refuser.refered_by) {
                  const find_ref2 = await userModel.findOne({referal_id: find_refuser.refered_by });
                  if (find_ref2) {
                    const find_paymentref2 = await referral_walletModel.findOne({userId: find_ref2._id});
                    if (find_paymentref2) {
                      if(find_ref2.Addreferral){
                      const update_ref2payment = await referral_walletModel.findOneAndUpdate(
                        { userId: find_ref2._id },
                        { total_amount: parseFloat(find_paymentref2.total_amount) + parseFloat(four_refer),}, 
                        { new: true });
                        const schema2 = new referrals_logModel()
                      schema2.amount = parseFloat(four_refer)
                      schema2.userId = find_ref2._id
                      schema2.level = "l2"
                      schema2.addedBy = find_user._id
                      schema2.save()
                      }
                      if (find_ref2.refered_by) {
                        const find_ref3 = await userModel.findOne({ referal_id: find_ref2.refered_by });
                        if (find_ref3) {
                          const find_paymentref3 = await referral_walletModel.findOne({userId: find_ref3._id});
                          if (find_paymentref3) {
                            if(find_ref3.Addreferral){
                            const update_ref3payment = await referral_walletModel.findOneAndUpdate(
                              { userId: find_ref3._id },
                              { total_amount: parseFloat(find_paymentref3.total_amount) + parseFloat(three_refer), },{ new: true });
                              const schema3 = new referrals_logModel()
                            schema3.amount = parseFloat(three_refer)
                            schema3.userId = find_ref3._id
                            schema3.level = "l3"
                            schema3.addedBy = find_user._id
                            schema3.save()
                            }
                            if (find_ref3.refered_by) {
                              const find_ref4 = await userModel.findOne({ referal_id: find_ref3.refered_by });
                              if (find_ref4) {
                                const find_paymentref4 = await referral_walletModel.findOne({ userId: find_ref4._id});
                                if (find_paymentref4) {
                                  if(find_ref4.Addreferral){
                                  const update_ref4payment = await referral_walletModel.findOneAndUpdate(
                                    { userId: find_ref4._id },
                                     { total_amount: parseFloat(find_paymentref4.total_amount) + parseFloat(two_refer), },{ new: true });const schema4 = new referrals_logModel()
                                     schema4.amount = parseFloat(two_refer)
                                     schema4.userId = find_ref4._id
                                     schema4.level = "l4"
                                     schema4.addedBy = find_user._id
                                     schema4.save()
                                  }
                                  if (find_ref4.refered_by) {
                                    const find_ref5 = await userModel.findOne({referal_id: find_ref4.refered_by});
                                    if (find_ref5) {
                                      const find_paymentref5 = await referral_walletModel.findOne({userId: find_ref5._id});
                                      if (find_paymentref5) {
                                        if(find_ref5.Addreferral){
                                        const update_ref5payment = await referral_walletModel.findOneAndUpdate(
                                          { userId: find_ref5._id },
                                           {total_amount: parseFloat( find_paymentref5.total_amount) + last_refer},{ new: true } );
                                           const schema5 = new referrals_logModel()
                                        schema5.amount = parseFloat(last_refer)
                                        schema5.userId = find_ref5._id
                                        schema5.level = "l5"
                                        schema5.addedBy = find_user._id
                                        schema5.save()
                                        }
                                        if(find_ref5.refered_by){
                                          const find_ref6 = await userModel.findOne({referal_id: find_ref5.refered_by});
                                          if(find_ref6){
                                            const find_paymentref6 = await referral_walletModel.findOne({userId: find_ref6._id});
                                            if(find_paymentref6){
                                              if(find_ref6.Addreferral){
                                              const update_ref6payment = await referral_walletModel.findOneAndUpdate(
                                                { userId: find_ref6._id },
                                                 {total_amount: parseFloat( find_paymentref6.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                 const schema6 = new referrals_logModel()
                                                  schema6.amount = parseFloat(remaining_refer)
                                                  schema6.userId = find_ref6._id
                                                  schema6.level = "l6"
                                                  schema6.addedBy = find_user._id
                                                  schema6.save()
                                              }
                                                  if(find_ref6.refered_by){
                                                    const find_ref7 = await userModel.findOne({referal_id: find_ref6.refered_by});
                                                    if(find_ref7){
                                                      const find_paymentref7 = await referral_walletModel.findOne({userId: find_ref7._id});
                                                      if(find_paymentref7){
                                                        if(find_ref7.Addreferral){
                                                        const update_ref7payment = await referral_walletModel.findOneAndUpdate(
                                                          { userId: find_ref7._id },
                                                           {total_amount: parseFloat( find_paymentref7.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                           const schema7 = new referrals_logModel()
                                                            schema7.amount = parseFloat(remaining_refer)
                                                            schema7.userId = find_ref7._id
                                                            schema7.level = "l7"
                                                            schema7.addedBy = find_user._id
                                                            schema7.save()
                                                        }
                                                            if(find_ref7.refered_by){
                                                              const find_ref8 = await userModel.findOne({referal_id: find_ref7.refered_by});
                                                              if(find_ref8){
                                                                const find_paymentref8 = await referral_walletModel.findOne({userId: find_ref8._id});
                                                                if(find_paymentref8){
                                                                  if(find_ref8.Addreferral){
                                                                  const update_ref8payment = await referral_walletModel.findOneAndUpdate(
                                                                    { userId: find_ref8._id },
                                                                     {total_amount: parseFloat( find_paymentref8.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                     const schema8 = new referrals_logModel()
                                                                      schema8.amount = parseFloat(remaining_refer)
                                                                      schema8.userId = find_ref8._id
                                                                      schema8.level = "l8"
                                                                      schema8.addedBy = find_user._id
                                                                      schema8.save()
                                                                  }
                                                                      if(find_ref8.refered_by){
                                                                        const find_ref9 = await userModel.findOne({referal_id: find_ref8.refered_by});
                                                                        if(find_ref9){
                                                                          const find_paymentref9 = await referral_walletModel.findOne({userId: find_ref9._id});
                                                                          if(find_paymentref9){
                                                                            if(find_ref9.Addreferral){
                                                                            const update_ref9payment = await referral_walletModel.findOneAndUpdate(
                                                                              { userId: find_ref9._id },
                                                                               {total_amount: parseFloat( find_paymentref9.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                               const schema9 = new referrals_logModel()
                                                                                schema9.amount = parseFloat(remaining_refer)
                                                                                schema9.userId = find_ref9._id
                                                                                schema9.level = "l9"
                                                                                schema9.addedBy = find_user._id
                                                                                schema9.save()
                                                                            }
                                                                                if(find_ref9.refered_by){
                                                                                  const find_ref10 = await userModel.findOne({referal_id: find_ref9.refered_by});
                                                                                  if(find_ref10){
                                                                                    const find_paymentref10 = await referral_walletModel.findOne({userId: find_ref10._id});
                                                                                    if(find_paymentref10){
                                                                                      if(find_ref10.Addreferral){
                                                                                      const update_ref10payment = await referral_walletModel.findOneAndUpdate(
                                                                                        { userId: find_ref10._id },
                                                                                         {total_amount: parseFloat( find_paymentref10.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                         const schema10 = new referrals_logModel()
                                                                                          schema10.amount = parseFloat(remaining_refer)
                                                                                          schema10.userId = find_ref10._id
                                                                                          schema10.level = "l10"
                                                                                          schema10.addedBy = find_user._id
                                                                                          schema10.save()
                                                                                      }
                                                                                          if(find_ref10.refered_by){
                                                                                            const find_ref11 = await userModel.findOne({referal_id: find_ref10.refered_by});
                                                                                            if(find_ref11){
                                                                                              const find_paymentref11 = await referral_walletModel.findOne({userId: find_ref11._id});
                                                                                              if(find_paymentref11){
                                                                                                if(find_ref11.Addreferral){
                                                                                                const update_ref11payment = await referral_walletModel.findOneAndUpdate(
                                                                                                  { userId: find_ref11._id },
                                                                                                   {total_amount: parseFloat( find_paymentref11.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                   const schema11 = new referrals_logModel()
                                                                                                    schema11.amount = parseFloat(remaining_refer)
                                                                                                    schema11.userId = find_ref11._id
                                                                                                    schema11.level = "l11"
                                                                                                    schema11.addedBy = find_user._id
                                                                                                    schema11.save()
                                                                                                }
                                                                                                    if(find_ref11.refered_by){
                                                                                                      const find_ref12 = await userModel.findOne({referal_id: find_ref11.refered_by});
                                                                                                      if(find_ref12){
                                                                                                        const find_paymentref12 = await referral_walletModel.findOne({userId: find_ref12._id});
                                                                                                        if(find_paymentref12){
                                                                                                          if(find_ref12.Addreferral){
                                                                                                          const update_ref12payment = await referral_walletModel.findOneAndUpdate(
                                                                                                            { userId: find_ref12._id },
                                                                                                             {total_amount: parseFloat( find_paymentref12.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                             const schema12 = new referrals_logModel()
                                                                                                              schema12.amount = parseFloat(remaining_refer)
                                                                                                              schema12.userId = find_ref12._id
                                                                                                              schema12.level = "l12"
                                                                                                              schema12.addedBy = find_user._id
                                                                                                              schema12.save()
                                                                                                          }
                                                                                                              if(find_ref12.refered_by){
                                                                                                                const find_ref13 = await userModel.findOne({referal_id: find_ref12.refered_by});
                                                                                                                if(find_ref13){
                                                                                                                  const find_paymentref13 = await referral_walletModel.findOne({userId: find_ref13._id});
                                                                                                                  if(find_paymentref13){
                                                                                                                    if(find_ref13.Addreferral){
                                                                                                                    const update_ref13payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                      { userId: find_ref13._id },
                                                                                                                       {total_amount: parseFloat( find_paymentref13.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                       const schema13 = new referrals_logModel()
                                                                                                                        schema13.amount = parseFloat(remaining_refer)
                                                                                                                        schema13.userId = find_ref13._id
                                                                                                                        schema13.level = "l13"
                                                                                                                        schema13.addedBy = find_user._id
                                                                                                                        schema13.save()
                                                                                                                    }
                                                                                                                        if(find_ref13.refered_by){
                                                                                                                          const find_ref14 = await userModel.findOne({referal_id: find_ref13.refered_by});
                                                                                                                          if(find_ref14){
                                                                                                                            const find_paymentref14 = await referral_walletModel.findOne({userId: find_ref14._id});
                                                                                                                            if(find_paymentref14){
                                                                                                                              if(find_ref14.Addreferral){
                                                                                                                              const update_ref14payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                { userId: find_ref14._id },
                                                                                                                                 {total_amount: parseFloat( find_paymentref14.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                 const schema14 = new referrals_logModel()
                                                                                                                                  schema14.amount = parseFloat(remaining_refer)
                                                                                                                                  schema14.userId = find_ref14._id
                                                                                                                                  schema14.level = "l14"
                                                                                                                                  schema14.addedBy = find_user._id
                                                                                                                                  schema14.save()
                                                                                                                              }
                                                                                                                                  if(find_ref14.refered_by){
                                                                                                                                    const find_ref15 = await userModel.findOne({referal_id: find_ref14.refered_by});
                                                                                                                                    if(find_ref15){
                                                                                                                                      const find_paymentref15 = await referral_walletModel.findOne({userId: find_ref15._id});
                                                                                                                                      if(find_paymentref15){
                                                                                                                                        if(find_ref15.Addreferral){
                                                                                                                                        const update_ref15payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                          { userId: find_ref15._id },
                                                                                                                                           {total_amount: parseFloat( find_paymentref15.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                           const schema15 = new referrals_logModel()
                                                                                                                                            schema15.amount = parseFloat(remaining_refer)
                                                                                                                                            schema15.userId = find_ref15._id
                                                                                                                                            schema15.level = "l15"
                                                                                                                                            schema15.addedBy = find_user._id
                                                                                                                                            schema15.save()
                                                                                                                                        }
                                                                                                                                            return res.status(200).send({
                                                                                                                                              data: deposit_log,
                                                                                                                                              message: "reinvest successful",
                                                                                                                                              status: 1,
                                                                                                                                              error: null,
                                                                                                                                            });
                                                                                                                                      }
                                                                                                                                      else {
                                                                                                                                        return res.status(200).send({
                                                                                                                                          data: deposit_log,
                                                                                                                                          message: "reinvest successful",
                                                                                                                                          status: 1,
                                                                                                                                          error: null,
                                                                                                                                        });
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                    else {
                                                                                                                                      return res.status(200).send({
                                                                                                                                        data: deposit_log,
                                                                                                                                        message: "reinvest successful",
                                                                                                                                        status: 1,
                                                                                                                                        error: null,
                                                                                                                                      });
                                                                                                                                    }
                                                                                                                                   }
                                                                                                                                   else {
                                                                                                                                    return res.status(200).send({
                                                                                                                                      data: deposit_log,
                                                                                                                                      message: "reinvest successful",
                                                                                                                                      status: 1,
                                                                                                                                      error: null,
                                                                                                                                    });
                                                                                                                                  }
                                                                                                                            }
                                                                                                                            else {
                                                                                                                              return res.status(200).send({
                                                                                                                                data: deposit_log,
                                                                                                                                message: "reinvest successful",
                                                                                                                                status: 1,
                                                                                                                                error: null,
                                                                                                                              });
                                                                                                                            }
                                                                                                                          }
                                                                                                                          else {
                                                                                                                            return res.status(200).send({
                                                                                                                              data: deposit_log,
                                                                                                                              message: "reinvest successful",
                                                                                                                              status: 1,
                                                                                                                              error: null,
                                                                                                                            });
                                                                                                                          }
                                                                                                                         }
                                                                                                                         else {
                                                                                                                          return res.status(200).send({
                                                                                                                            data: deposit_log,
                                                                                                                            message: "reinvest successful",
                                                                                                                            status: 1,
                                                                                                                            error: null,
                                                                                                                          });
                                                                                                                        }
                                                                                                                  }
                                                                                                                  else {
                                                                                                                    return res.status(200).send({
                                                                                                                      data: deposit_log,
                                                                                                                      message: "reinvest successful",
                                                                                                                      status: 1,
                                                                                                                      error: null,
                                                                                                                    });
                                                                                                                  }
                                                                                                                }
                                                                                                                else {
                                                                                                                  return res.status(200).send({
                                                                                                                    data: deposit_log,
                                                                                                                    message: "reinvest successful",
                                                                                                                    status: 1,
                                                                                                                    error: null,
                                                                                                                  });
                                                                                                                }
                                                                                                               }
                                                                                                               else {
                                                                                                                return res.status(200).send({
                                                                                                                  data: deposit_log,
                                                                                                                  message: "reinvest successful",
                                                                                                                  status: 1,
                                                                                                                  error: null,
                                                                                                                });
                                                                                                              }
                                                                                                        }
                                                                                                        else {
                                                                                                          return res.status(200).send({
                                                                                                            data: deposit_log,
                                                                                                            message: "reinvest successful",
                                                                                                            status: 1,
                                                                                                            error: null,
                                                                                                          });
                                                                                                        }
                                                                                                      }
                                                                                                      else {
                                                                                                        return res.status(200).send({
                                                                                                          data: deposit_log,
                                                                                                          message: "reinvest successful",
                                                                                                          status: 1,
                                                                                                          error: null,
                                                                                                        });
                                                                                                      }
                                                                                                     }
                                                                                                     else {
                                                                                                      return res.status(200).send({
                                                                                                        data: deposit_log,
                                                                                                        message: "reinvest successful",
                                                                                                        status: 1,
                                                                                                        error: null,
                                                                                                      });
                                                                                                    }
                                                                                              }
                                                                                              else {
                                                                                                return res.status(200).send({
                                                                                                  data: deposit_log,
                                                                                                  message: "reinvest successful",
                                                                                                  status: 1,
                                                                                                  error: null,
                                                                                                });
                                                                                              }
                                                                                            }
                                                                                            else {
                                                                                              return res.status(200).send({
                                                                                                data: deposit_log,
                                                                                                message: "reinvest successful",
                                                                                                status: 1,
                                                                                                error: null,
                                                                                              });
                                                                                            }
                                                                                           }
                                                                                           else {
                                                                                            return res.status(200).send({
                                                                                              data: deposit_log,
                                                                                              message: "reinvest successful",
                                                                                              status: 1,
                                                                                              error: null,
                                                                                            });
                                                                                          }
                                                                                    }
                                                                                    else {
                                                                                      return res.status(200).send({
                                                                                        data: deposit_log,
                                                                                        message: "reinvest successful",
                                                                                        status: 1,
                                                                                        error: null,
                                                                                      });
                                                                                    }
                                                                                  }
                                                                                  else {
                                                                                    return res.status(200).send({
                                                                                      data: deposit_log,
                                                                                      message: "reinvest successful",
                                                                                      status: 1,
                                                                                      error: null,
                                                                                    });
                                                                                  }
                                                                                 }
                                                                                 else {
                                                                                  return res.status(200).send({
                                                                                    data: deposit_log,
                                                                                    message: "reinvest successful",
                                                                                    status: 1,
                                                                                    error: null,
                                                                                  });
                                                                                }
                                                                          }
                                                                          else {
                                                                            return res.status(200).send({
                                                                              data: deposit_log,
                                                                              message: "reinvest successful",
                                                                              status: 1,
                                                                              error: null,
                                                                            });
                                                                          }
                                                                        }
                                                                        else {
                                                                          return res.status(200).send({
                                                                            data: deposit_log,
                                                                            message: "reinvest successful",
                                                                            status: 1,
                                                                            error: null,
                                                                          });
                                                                        }
                                                                       }
                                                                       else {
                                                                        return res.status(200).send({
                                                                          data: deposit_log,
                                                                          message: "reinvest successful",
                                                                          status: 1,
                                                                          error: null,
                                                                        });
                                                                      }
                                                                }
                                                                else {
                                                                  return res.status(200).send({
                                                                    data: deposit_log,
                                                                    message: "reinvest successful",
                                                                    status: 1,
                                                                    error: null,
                                                                  });
                                                                }
                                                              }
                                                              else {
                                                                return res.status(200).send({
                                                                  data: deposit_log,
                                                                  message: "reinvest successful",
                                                                  status: 1,
                                                                  error: null,
                                                                });
                                                              }
                                                             }
                                                             else {
                                                              return res.status(200).send({
                                                                data: deposit_log,
                                                                message: "reinvest successful",
                                                                status: 1,
                                                                error: null,
                                                              });
                                                            }
                                                      }
                                                      else {
                                                        return res.status(200).send({
                                                          data: deposit_log,
                                                          message: "reinvest successful",
                                                          status: 1,
                                                          error: null,
                                                        });
                                                      }
                                                    }
                                                    else {
                                                      return res.status(200).send({
                                                        data: deposit_log,
                                                        message: "reinvest successful",
                                                        status: 1,
                                                        error: null,
                                                      });
                                                    }
                                                   }
                                                   else {
                                                    return res.status(200).send({
                                                      data: deposit_log,
                                                      message: "reinvest successful",
                                                      status: 1,
                                                      error: null,
                                                    });
                                                  }
                                            }
                                            else {
                                              return res.status(200).send({
                                                data: deposit_log,
                                                message: "reinvest successful",
                                                status: 1,
                                                error: null,
                                              });
                                            }
                                          }
                                          else {
                                            return res.status(200).send({
                                              data: deposit_log,
                                              message: "reinvest successful",
                                              status: 1,
                                              error: null,
                                            });
                                          }
                                         }
                                         else {
                                          return res.status(200).send({
                                            data: deposit_log,
                                            message: "reinvest successful",
                                            status: 1,
                                            error: null,
                                          });
                                        }
                                      } else {
                                        return res.status(200).send({
                                          data: deposit_log,
                                          message: "reinvest successful",
                                          status: 1,
                                          error: null,
                                        });
                                      }
                                    } else {
                                      return res.status(200).send({
                                        data: deposit_log,
                                        message: "reinvest successful",
                                        status: 1,
                                        error: null,
                                      });
                                    }
                                  } else {
                                    return res.status(200).send({
                                      data: deposit_log,
                                      message: "reinvest successful",
                                      status: 1,
                                      error: null,
                                    });
                                  }
                                } else {
                                  return res.status(200).send({
                                    data: deposit_log,
                                    message: "reinvest successful",
                                    status: 1,
                                    error: null,
                                  });
                                }
                              } else {
                                return res.status(200).send({
                                  data: deposit_log,
                                  message: "reinvest successful",
                                  status: 1,
                                  error: null,
                                });
                              }
                            } else {
                              return res.status(200).send({
                                data: deposit_log,
                                message: "reinvest successful",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            return res.status(200).send({
                              data: deposit_log,
                              message: "reinvest successful",
                              status: 1,
                              error: null,
                            });
                          }
                        } else {
                          return res.status(200).send({
                            data: deposit_log,
                            message: "reinvest successful",
                            status: 1,
                            error: null,
                          });
                        }
                      } else {
                        return res.status(200).send({
                          data: deposit_log,
                          message: "reinvest successful",
                          status: 1,
                          error: null,
                        });
                      }
                    } else {
                      return res.status(200).send({
                        data: deposit_log,
                        message: "reinvest successful",
                        status: 1,
                        error: null,
                      });
                    }
                  } else {
                    return res.status(200).send({
                      data: deposit_log,
                      message: "reinvest successful",
                      status: 1,
                      error: null,
                    });
                  }
                } else {
                  return res.status(200).send({
                    data: deposit_log,
                    message: "reinvest successful",
                    status: 1,
                    error: null,
                  });
                }
              } else {
                return res.status(200).send({
                  data: deposit_log,
                  message: "reinvest successful",
                  status: 1,
                  error: null,
                });
              }
            }
            } else {
              return res.status(200).send({
                data: deposit_log,
                message: "reinvest successful",
                status: 1,
                error: null,
              });
            }
          } else {
            return res.status(200).send({
              status: 1,
              message: "reinvest successful",
            });
          }
        }
      }
      // if(req.body.wallet_type == "liquidity"){
        const find_intrest = await interest_walletModel.findOne({ UserId: req.body.UserId });
        const find_referral_earnings = await referral_walletModel.findOne({ userId: req.body.UserId });
        const find_net_staking = await net_staking_walletModel.findOne({UserId: req.body.UserId,});
        console.log(find_intrest, "find_intrest");
        console.log(find_referral_earnings, "find_referral_earnings");
        console.log(find_net_staking, "find_net_staking");

        const total_withdrawal = parseFloat(find_intrest.total_amount)  + parseFloat(find_net_staking.total_amount) + parseFloat(find_referral_earnings.total_amount);
        console.log(total_withdrawal, "total_withdrawal");
        const total_amount = req.body.amount;
        const percentage = req.body.percentage;
        var bonus = 0
       if(percentage == 50){
          bonus = 2
        }else if(percentage == 100){
          bonus = 5
        }
        const final_deposit = (total_withdrawal * percentage) / 100;
        console.log(final_deposit, "data");
        const bonus_add = (final_deposit * bonus)/100;
        console.log(bonus_add,"bonus for percent")
        const value_intrest = find_intrest.total_amount - (find_intrest.total_amount * percentage) / 100;
        const value_referral = find_referral_earnings.total_amount - (find_referral_earnings.total_amount * percentage) / 100;
        const value_staking = find_net_staking.total_amount - (find_net_staking.total_amount * percentage) / 100;
        console.log(value_intrest, "value_intrest");
        console.log(value_referral, "value_referral");
        console.log(value_staking, "value_staking");
        const update_interest_wallet = await interest_walletModel.findOneAndUpdate({ UserId: req.body.UserId },{ total_amount: value_intrest },{ new: true });
        const update_referral_wallet = await referral_walletModel.findOneAndUpdate({ userId: req.body.UserId },{ total_amount: value_referral },{ new: true });
        const update_net_staking = await net_staking_walletModel.findOneAndUpdate({ UserId: req.body.UserId },{ total_amount: value_staking },{ new: true });
        console.log(update_interest_wallet, "update_interest_wallet");
        console.log(update_referral_wallet, "update_referral_wallet");
        console.log(update_net_staking, "update_net_staking");
        const random_number1 = otpGenerator.generate(5, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false,});
        const price = await axios.get( "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b");
        console.log(price.data.pairs[0].priceUsd, "prices");
        const GGO_usd = price.data.pairs[0].priceUsd;
        const currency_value = 77.96;
        console.log(currency_value, "currency_value");
        const GGO_inr = parseFloat(currency_value * GGO_usd);
        console.log(GGO_inr, "GGO_inr");
        const total_ggo = final_deposit / GGO_inr;
        console.log(total_ggo, "total_ggo");
        const bonus_crypto = bonus_add / GGO_inr;
        console.log(bonus_crypto,"bonus_crypto")
        console.log(req.body.UserId, "userId");
        const random_number = otpGenerator.generate(20, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: true });
        const OrderId = "order_" + random_number;
        const transaction_id = otpGenerator.generate(6, { upperCaseAlphabets: false,specialChars: false, lowerCaseAlphabets: false });
        const find_payment = await paymentModel.findOne({userId: req.body.UserId});
        const schema = new deposit_logModel();
        schema.userId = req.body.UserId;
        schema.crypto = parseFloat(total_ggo)+parseFloat(bonus_crypto);
        schema.holding_price = GGO_inr;
        schema.staking_id = random_number1;
        schema.orderId = OrderId;
        schema.amount = parseFloat(final_deposit)+parseFloat(bonus_add);
        schema.paymentCompleted = true;
        schema.currencyType = "INR";
        schema.paymentType = "Reinvest";
        schema.status = "Success";
        schema.previous_transaction = find_payment.total_amount
        schema.percentage = percentage
        const deposit_log = await deposit_logModel.create(schema);
        console.log(deposit_log, "deposit");
        
        const interest_schema = new interest_withdraw_logModel()
        interest_schema.userId = req.body.UserId
        interest_schema.amount = (find_intrest.total_amount * percentage) / 100;
        interest_schema.percentage = percentage
        interest_schema.reinvest_id = deposit_log._id
        interest_schema.wallet_type = req.body.wallet_type
        const create_interest_log = await interest_withdraw_logModel.create(interest_schema);
        const referral_schema = new referral_withdraw_logModel()
        referral_schema.userId = req.body.UserId
        referral_schema.amount = (find_referral_earnings.total_amount * percentage) / 100;
        referral_schema.percentage = percentage
        referral_schema.reinvest_id = deposit_log._id
        referral_schema.wallet_type = req.body.wallet_type
        const create_referral_log = await referral_withdraw_logModel.create(referral_schema);
        const netstaking_schema = new net_staking_withdrawal_logModel()
        netstaking_schema.userId = req.body.UserId
        netstaking_schema.amount = (find_net_staking.total_amount * percentage) / 100;
        netstaking_schema.percentage = percentage
        netstaking_schema.reinvest_id = deposit_log._id
        netstaking_schema.wallet_type = req.body.wallet_type
        const create_netstaking_log = await net_staking_withdrawal_logModel.create(netstaking_schema);
        
        // checking interest
        var weekly_pr;
        var annual_pr;
        var monthly_pr;
    
        if (final_deposit <= 10000) {
          weekly_pr = 0.339;
          annual_pr = 17.65;
          monthly_pr = 1.358;
        } else if (final_deposit <= 20000) {
          weekly_pr = 0.341;
          annual_pr = 17.75;
          monthly_pr = 1.365;
        } else if (final_deposit <= 30000) {
          weekly_pr = 0.343;
          annual_pr = 17.85;
          monthly_pr = 1.373;
        } else if (final_deposit <= 40000) {
          weekly_pr = 0.345;
          annual_pr = 17.95;
          monthly_pr = 1.381;
        } else if (final_deposit <= 50000) {
          weekly_pr = 0.347;
          annual_pr = 18.05;
          monthly_pr = 1.388;
        } else if (final_deposit <= 60000) {
          weekly_pr = 0.349;
          annual_pr = 18.15;
          monthly_pr = 1.396;
        } else if (final_deposit <= 70000) {
          weekly_pr = 0.351;
          annual_pr = 18.25;
          monthly_pr = 1.404;
        } else if (final_deposit <= 80000) {
          weekly_pr = 0.353;
          annual_pr = 18.35;
          monthly_pr = 1.412;
        } else if (final_deposit <= 90000) {
          weekly_pr = 0.355;
          annual_pr = 18.45;
          monthly_pr = 1.419;
        } else if (final_deposit <= 100000) {
          weekly_pr = 0.357;
          annual_pr = 18.55;
          monthly_pr = 1.427;
        } else if (final_deposit <= 110000) {
          weekly_pr = 0.359;
          annual_pr = 18.65;
          monthly_pr = 1.435;
        } else if (final_deposit <= 120000) {
          weekly_pr = 0.361;
          annual_pr = 18.75;
          monthly_pr = 1.442;
        } else if (final_deposit <= 130000) {
          weekly_pr = 0.363;
          annual_pr = 18.85;
          monthly_pr = 1.450;
        } else if (final_deposit <= 140000) {
          weekly_pr = 0.364;
          annual_pr = 18.95;
          monthly_pr = 1.458;
        } else if (final_deposit <= 150000) {
          weekly_pr = 0.366;
          annual_pr = 19.05;
          monthly_pr = 1.465;
        } else if (final_deposit <= 160000) {
          weekly_pr = 0.368;
          annual_pr = 19.15;
          monthly_pr = 1.473;
        } else if (final_deposit <= 170000) {
          weekly_pr = 0.370;
          annual_pr = 19.25;
          monthly_pr = 1.481;
        } else if (final_deposit <= 180000) {
          weekly_pr = 0.372;
          annual_pr = 19.35;
          monthly_pr = 1.488;
        } else if (final_deposit <= 190000) {
          weekly_pr = 0.374;
          annual_pr = 19.45;
          monthly_pr = 1.496;
        } else if (final_deposit <= 200000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
        } else if (final_deposit <= 210000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
        } else if (final_deposit <= 220000) {
          weekly_pr = 0.380;
          annual_pr = 19.75;
          monthly_pr = 1.519;
        } else if (final_deposit <= 230000) {
          weekly_pr = 0.382;
          annual_pr = 19.85;
          monthly_pr = 1.527;
        } else if (final_deposit <= 240000) {
          weekly_pr = 0.384;
          annual_pr = 19.95;
          monthly_pr = 1.535;
        } else if (final_deposit <= 250000) {
          weekly_pr = 0.386;
          annual_pr = 20.05;
          monthly_pr = 1.542;
        } else if (final_deposit <= 260000) {
          weekly_pr = 0.388;
          annual_pr = 20.15;
          monthly_pr = 1.550;
        } else if (final_deposit <= 270000) {
          weekly_pr = 0.389;
          annual_pr = 20.25;
          monthly_pr = 1.558;
        } else if (final_deposit <= 280000) {
          weekly_pr = 0.391;
          annual_pr = 20.35;
          monthly_pr = 1.565;
        } else if (final_deposit <= 290000) {
          weekly_pr = 0.393;
          annual_pr = 20.45;
          monthly_pr = 1.573;
        } else if (final_deposit <= 300000) {
          weekly_pr = 0.395;
          annual_pr = 20.55;
          monthly_pr = 1.581;
        } else if (final_deposit <= 310000) {
          weekly_pr = 0.397;
          annual_pr = 20.65;
          monthly_pr = 1.588;
        } else if (final_deposit <= 320000) {
          weekly_pr = 0.399;
          annual_pr = 20.75;
          monthly_pr = 1.596;
        } else if (final_deposit <= 330000) {
          weekly_pr = 0.401;
          annual_pr = 20.85;
          monthly_pr = 1.604;
        } else if (final_deposit <= 340000) {
          weekly_pr = 0.403;
          annual_pr = 20.95;
          monthly_pr = 1.612;
        } else if (final_deposit <= 350000) {
          weekly_pr = 0.405;
          annual_pr = 21.05;
          monthly_pr = 1.619;
        } else if (final_deposit <= 360000) {
          weekly_pr = 0.407;
          annual_pr = 21.15;
          monthly_pr = 1.627;
        } else if (final_deposit <= 370000) {
          weekly_pr = 0.409;
          annual_pr = 21.25;
          monthly_pr = 1.635;
        } else if (final_deposit <= 380000) {
          weekly_pr = 0.411;
          annual_pr = 21.35;
          monthly_pr = 1.642;
        } else if (final_deposit <= 390000) {
          weekly_pr = 0.413;
          annual_pr = 21.45;
          monthly_pr = 1.650;
        } else if (final_deposit <= 400000) {
          weekly_pr = 0.414;
          annual_pr = 21.55;
          monthly_pr = 1.658;
        } else if (final_deposit <= 410000) {
          weekly_pr = 0.416;
          annual_pr = 21.65;
          monthly_pr = 1.665;
        } else if (final_deposit <= 420000) {
          weekly_pr = 0.418;
          annual_pr = 21.75;
          monthly_pr = 1.673;
        } else if (final_deposit <= 430000) {
          weekly_pr = 0.420;
          annual_pr = 21.85;
          monthly_pr = 1.681;
        } else if (final_deposit <= 440000) {
          weekly_pr = 0.422;
          annual_pr = 21.95;
          monthly_pr = 1.688;
        } else if (final_deposit <= 450000) {
          weekly_pr = 0.424;
          annual_pr = 22.05;
          monthly_pr = 1.696;
        } else if (final_deposit <= 460000) {
          weekly_pr = 0.426;
          annual_pr = 22.15;
          monthly_pr = 1.704;
        } else if (final_deposit <= 470000) {
          weekly_pr = 0.428;
          annual_pr = 22.25;
          monthly_pr = 1.712;
        } else if (final_deposit <= 480000) {
          weekly_pr = 0.430;
          annual_pr = 22.35;
          monthly_pr = 1.719;
        } else if (final_deposit <= 490000) {
          weekly_pr = 0.432;
          annual_pr = 22.45;
          monthly_pr = 1.727;
        } else if (final_deposit <= 500000) {
          weekly_pr = 0.434;
          annual_pr = 22.55;
          monthly_pr = 1.735;
        } else if (final_deposit <= 600000) {
          weekly_pr = 0.436;
          annual_pr = 22.65;
          monthly_pr = 1.742;
        } else if (final_deposit <= 700000) {
          weekly_pr = 0.438;
          annual_pr = 22.75;
          monthly_pr = 1.750;
        } else if (final_deposit <= 800000) {
          weekly_pr = 0.439;
          annual_pr = 22.85;
          monthly_pr = 1.758;
        } else if (final_deposit <= 900000) {
          weekly_pr = 0.441;
          annual_pr = 22.95;
          monthly_pr = 1.765;
        } else if (final_deposit <= 1000000) {
          weekly_pr = 0.445;
          annual_pr = 23.15;
          monthly_pr = 1.781;
        } else if (final_deposit <= 1500000) {
          weekly_pr = 0.447;
          annual_pr = 23.25;
          monthly_pr = 1.788;
        } else if (final_deposit <= 2000000) {
          weekly_pr = 0.449;
          annual_pr = 23.35;
          monthly_pr = 1.796;
        } else if (final_deposit <= 2500000) {
          weekly_pr = 0.451;
          annual_pr = 23.45;
          monthly_pr = 1.804;
        } else if (final_deposit <= 3000000) {
          weekly_pr = 0.453;
          annual_pr = 23.55;
          monthly_pr = 1.812;
        } else if (final_deposit <= 3500000) {
          weekly_pr = 0.455;
          annual_pr = 23.65;
          monthly_pr = 1.819;
        } else if (final_deposit <= 4000000) {
          weekly_pr = 0.457;
          annual_pr = 23.75;
          monthly_pr = 1.827;
        } else if (final_deposit <= 4500000) {
          weekly_pr = 0.459;
          annual_pr = 23.65;
          monthly_pr = 1.835;
        }else if (final_deposit <= 5100000) {
          weekly_pr = 0.462;
          annual_pr = 23.55;
          monthly_pr = 1.846;
        }

        const weekly_payout = (weekly_pr * final_deposit) / 100;
        const monthly_payout = (monthly_pr * final_deposit) / 100;
        const annual_payout = (annual_pr * final_deposit) / 100;
        // end checking interest

        // interest adding
        const d = new Date();
        let day = d.getDay();
        let month = d.getMonth();
        let date = d.getDate();
        let hour = d.getHours();
        let min = d.getMinutes();
        // if (req.body.interest_type == "weekly") {
        //   console.log(deposit_log.userId, "id");
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = deposit_log.userId;
        //   schema1.deposit_id = deposit_log._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = deposit_log.staking_id;
        //   schema1.intrest_amount = parseFloat(weekly_payout);
        //   schema1.amount = final_deposit;
        //   schema1.status = true;
        //   schema1.interest_percentage = weekly_pr;
        //   schema1.day = day;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "weekly";
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "create_history");
        //   schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
        //     const schema = new interest_logModel();
        //     schema.UserId = deposit_log.userId;
        //     schema.interest_amount = parseFloat(weekly_payout);
        //     schema.status = "success";
        //     schema.payment_completed = true;
        //     schema.intrest_type = "weekly";
        //     schema.hours = hour;
        //     schema.day = day;
        //     schema.minute = min;
        //     const create_interest = await interest_logModel.create(schema);
        //     const find_interest_wallet = await interest_walletModel.findOne({
        //       UserId: deposit_log.userId,
        //     });
        //     if (find_interest_wallet) {
        //       const update_interest_wallet =
        //         await interest_walletModel.findOneAndUpdate(
        //           { UserId: deposit_log.userId },
        //           {
        //             total_amount:
        //               parseFloat(find_interest_wallet.total_amount) +
        //               parseFloat(weekly_payout),
        //           },
        //           { new: true }
        //         );
        //     } else {
        //       const schema1 = new interest_walletModel();
        //       schema1.UserId = deposit_log.userId;
        //       schema1.total_amount = parseFloat(weekly_payout);
        //       const create_interest_wallet = await interest_walletModel.create(
        //         schema1
        //       );
        //     }
        //   });
        // } 
        // if (req.body.interest_type == "monthly") {
          const schema1 = new intrest_historyModel();
          schema1.UserId = deposit_log.userId;
          schema1.deposit_id = deposit_log._id;
          schema1.transaction_id = transaction_id;
          schema1.staking_id = deposit_log.staking_id;
          schema1.intrest_amount = parseFloat(monthly_payout);
          schema1.amount = final_deposit;
          schema1.status = true;
          schema1.interest_percentage = monthly_pr;
          schema1.date = date;
          schema1.hours = hour;
          schema1.minute = min;
          schema1.interest_type = "monthly";
          schema1.wallet_type = req.body.wallet_type;
          const create_history = await intrest_historyModel.create(schema1);
          console.log(create_history, "create_history");
          schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
            const schema = new interest_logModel();
            schema.UserId = deposit_log.userId;
            schema.interest_amount = parseFloat(monthly_payout);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "monthly";
            schema.hours = hour;
            schema.date = date;
            schema.minute = min;
            schema.wallet_type = req.body.wallet_type;
            const create_interest = await interest_logModel.create(schema);
            const find_interest_wallet = await interest_walletModel.findOne({ UserId: deposit_log.userId,});
            if (find_interest_wallet) {
              const update_interest_wallet = await interest_walletModel.findOneAndUpdate({ UserId: deposit_log.userId },
              { total_amount:
                parseFloat(find_interest_wallet.total_amount) +
                parseFloat(monthly_payout),
              },{ new: true });
            } else {
              const schema1 = new interest_walletModel();
              schema1.UserId = deposit_log.userId;
              schema1.total_amount = parseFloat(monthly_payout);
              const create_interest_wallet = await interest_walletModel.create(schema1);
            }
          });
        // } 
        // else if (req.body.interest_type == "yearly") {
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = deposit_log.userId;
        //   schema1.deposit_id = deposit_log._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = deposit_log.staking_id;
        //   schema1.intrest_amount = parseFloat(annual_payout);
        //   schema1.amount = final_deposit;
        //   schema1.status = true;
        //   schema1.interest_percentage = annual_pr;
        //   schema1.month = month;
        //   schema1.date = date;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "yearly";
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "create_history");
        //   schedule.scheduleJob(
        //     `${min} ${hour} ${date} ${month + 1} *`,
        //     async () => {
        //       const schema = new interest_logModel();
        //       schema.UserId = deposit_log.userId;
        //       schema.interest_amount = parseFloat(annual_payout);
        //       schema.status = "success";
        //       schema.payment_completed = true;
        //       schema.intrest_type = "yearly";
        //       schema.hours = hour;
        //       schema.date = date;
        //       schema.month = month + 1;
        //       schema.minute = min;
        //       const create_interest = await interest_logModel.create(schema);
        //       const find_interest_wallet = await interest_walletModel.findOne({
        //         UserId: deposit_log.userId,
        //       });
        //       if (find_interest_wallet) {
        //         const update_interest_wallet =
        //           await interest_walletModel.findOneAndUpdate(
        //             { UserId: deposit_log.userId },
        //             {
        //               total_amount:
        //                 parseFloat(find_interest_wallet.total_amount) +
        //                 parseFloat(annual_payout),
        //             },
        //             { new: true }
        //           );
        //       } else {
        //         const schema1 = new interest_walletModel();
        //         schema1.UserId = deposit_log.userId;
        //         schema1.total_amount = parseFloat(annual_payout);
        //         const create_interest_wallet = await interest_walletModel.create(
        //           schema1
        //         );
        //       }
        //     }
        //   );
        // } ,
        // else {
        //   res.status(200).send({
        //     data: null,
        //     message: "wrong Interest type2",
        //     status: 0,
        //   });
        // }
        // ending interest adding

        if (find_payment) {
          const update_payment = await paymentModel.findOneAndUpdate({ userId: req.body.UserId },
          { total_amount:
            parseFloat(find_payment.total_amount) + parseFloat(final_deposit)+parseFloat(bonus_add),
            crypto: parseFloat(find_payment.crypto) + parseFloat(total_ggo)+parseFloat(bonus_crypto),
          },{ new: true });
          console.log(update_payment,"update_payment")
          if (find_user.refered_by) {
            const find_refuser = await userModel.findOne({ referal_id: find_user.refered_by});
            if (find_refuser) {
              if(find_refuser._id == '633ac010ff0962794cc9851d' || find_refuser._id == '635b651591a2d6ba72072375' || find_refuser._id == "6389f8aae953e34e89e5b411"){
                const one_refer = (parseInt(final_deposit) * 12.5) / 100;
              const four_refer = (parseInt(final_deposit) * 1) / 100;
              const three_refer = (parseInt(final_deposit) * 1) / 100;
              const last_refer = (parseInt(final_deposit) * 1) / 100;
              const two_refer = (parseInt(final_deposit) * 1) / 100;
              const  remaining_refer = (parseInt(final_deposit)*1)/100;
              console.log(one_refer, "5%ref");
              console.log(two_refer, "2%ref");
              const find_refpayment = await referral_walletModel.findOne({
                userId: find_refuser._id,
              });
              if (find_refpayment) {
                if(find_refuser.Addreferral){
                const update_refpayment =
                  await referral_walletModel.findOneAndUpdate(
                    { userId: find_refuser._id },
                    {
                      total_amount:
                        parseFloat(find_refpayment.total_amount) +
                        parseFloat(one_refer),
                    },
                    { new: true }
                  );
                  const schema1 = new referrals_logModel()
                  schema1.amount = parseFloat(one_refer)
                  schema1.userId = find_refuser._id
                  schema1.level = "l1"
                  schema1.addedBy = find_user._id
                  schema1.save()
                }
                if (find_refuser.refered_by) {
                  const find_ref2 = await userModel.findOne({
                    referal_id: find_refuser.refered_by,
                  });
                  if (find_ref2) {
                    const find_paymentref2 = await referral_walletModel.findOne({
                      userId: find_ref2._id,
                    });
                    if (find_paymentref2) {
                      if(find_ref2.Addreferral){
                      const update_ref2payment =
                        await referral_walletModel.findOneAndUpdate(
                          { userId: find_ref2._id },
                          {
                            total_amount:
                              parseFloat(find_paymentref2.total_amount) +
                              parseFloat(four_refer),
                          },
                          { new: true }
                        );
                        const schema2 = new referrals_logModel()
                        schema2.amount = parseFloat(four_refer)
                        schema2.userId = find_ref2._id
                        schema2.level = "l2"
                        schema2.addedBy = find_user._id
                        schema2.save()
                      }
                      if (find_ref2.refered_by) {
                        const find_ref3 = await userModel.findOne({
                          referal_id: find_ref2.refered_by,
                        });
                        if (find_ref3) {
                          const find_paymentref3 =
                            await referral_walletModel.findOne({
                              userId: find_ref3._id,
                            });
                          if (find_paymentref3) {
                            if(find_ref3.Addreferral){
                            const update_ref3payment =
                              await referral_walletModel.findOneAndUpdate(
                                { userId: find_ref3._id },
                                {
                                  total_amount:
                                    parseFloat(find_paymentref3.total_amount) +
                                    parseFloat(three_refer),
                                },
                                { new: true }
                              );
                              const schema3 = new referrals_logModel()
                              schema3.amount = parseFloat(three_refer)
                              schema3.userId = find_ref3._id
                              schema3.level = "l3"
                              schema3.addedBy = find_user._id
                              schema3.save()
                            }
                            if (find_ref3.refered_by) {
                              const find_ref4 = await userModel.findOne({
                                referal_id: find_ref3.refered_by,
                              });
                              if (find_ref4) {
                                const find_paymentref4 =
                                  await referral_walletModel.findOne({
                                    userId: find_ref4._id,
                                  });
                                if (find_paymentref4) {
                                  if(find_ref4.Addreferral){
                                  const update_ref4payment =
                                    await referral_walletModel.findOneAndUpdate(
                                      { userId: find_ref4._id },
                                      {
                                        total_amount:
                                          parseFloat(
                                            find_paymentref4.total_amount
                                          ) + parseFloat(two_refer),
                                      },
                                      { new: true }
                                    );
                                    const schema4 = new referrals_logModel()
                                    schema4.amount = parseFloat(two_refer)
                                    schema4.userId = find_ref4._id
                                    schema4.level = "l4"
                                    schema4.addedBy = find_user._id
                                    schema4.save()
                                  }
                                  if (find_ref4.refered_by) {
                                    const find_ref5 = await userModel.findOne({
                                      referal_id: find_ref4.refered_by,
                                    });
                                    if (find_ref5) {
                                      const find_paymentref5 =
                                        await referral_walletModel.findOne({
                                          userId: find_ref5._id,
                                        });
                                      if (find_paymentref5) {
                                        if(find_ref5.Addreferral){
                                        const update_ref5payment =
                                          await referral_walletModel.findOneAndUpdate(
                                            { userId: find_ref5._id },
                                            {
                                              total_amount:
                                                parseFloat(
                                                  find_paymentref5.total_amount
                                                ) + last_refer,
                                            },
                                            { new: true }
                                          );
                                          const schema5 = new referrals_logModel()
                                          schema5.amount = parseFloat(last_refer)
                                          schema5.userId = find_ref5._id
                                          schema5.level = "l5"
                                          schema5.addedBy = find_user._id
                                          schema5.save()
                                        }
                                          if(find_ref5.refered_by){
                                            const find_ref6 = await userModel.findOne({referal_id: find_ref5.refered_by});
                                            if(find_ref6){
                                              const find_paymentref6 = await referral_walletModel.findOne({userId: find_ref6._id});
                                              if(find_paymentref6){
                                                if(find_ref6.Addreferral){
                                                const update_ref6payment = await referral_walletModel.findOneAndUpdate(
                                                  { userId: find_ref6._id },
                                                   {total_amount: parseFloat( find_paymentref6.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                   const schema6 = new referrals_logModel()
                                                    schema6.amount = parseFloat(remaining_refer)
                                                    schema6.userId = find_ref6._id
                                                    schema6.level = "l6"
                                                    schema6.addedBy = find_user._id
                                                    schema6.save()
                                                }
                                                    if(find_ref6.refered_by){
                                                      const find_ref7 = await userModel.findOne({referal_id: find_ref6.refered_by});
                                                      if(find_ref7){
                                                        const find_paymentref7 = await referral_walletModel.findOne({userId: find_ref7._id});
                                                        if(find_paymentref7){
                                                          if(find_ref7.Addreferral){
                                                          const update_ref7payment = await referral_walletModel.findOneAndUpdate(
                                                            { userId: find_ref7._id },
                                                             {total_amount: parseFloat( find_paymentref7.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                             const schema7 = new referrals_logModel()
                                                              schema7.amount = parseFloat(remaining_refer)
                                                              schema7.userId = find_ref7._id
                                                              schema7.level = "l7"
                                                              schema7.addedBy = find_user._id
                                                              schema7.save()
                                                          }
                                                              if(find_ref7.refered_by){
                                                                const find_ref8 = await userModel.findOne({referal_id: find_ref7.refered_by});
                                                                if(find_ref8){
                                                                  const find_paymentref8 = await referral_walletModel.findOne({userId: find_ref8._id});
                                                                  if(find_paymentref8){
                                                                    if(find_ref8.Addreferral){
                                                                    const update_ref8payment = await referral_walletModel.findOneAndUpdate(
                                                                      { userId: find_ref8._id },
                                                                       {total_amount: parseFloat( find_paymentref8.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                       const schema8 = new referrals_logModel()
                                                                        schema8.amount = parseFloat(remaining_refer)
                                                                        schema8.userId = find_ref8._id
                                                                        schema8.level = "l8"
                                                                        schema8.addedBy = find_user._id
                                                                        schema8.save()
                                                                    }
                                                                        if(find_ref8.refered_by){
                                                                          const find_ref9 = await userModel.findOne({referal_id: find_ref8.refered_by});
                                                                          if(find_ref9){
                                                                            const find_paymentref9 = await referral_walletModel.findOne({userId: find_ref9._id});
                                                                            if(find_paymentref9){
                                                                              if(find_ref9.Addreferral){
                                                                              const update_ref9payment = await referral_walletModel.findOneAndUpdate(
                                                                                { userId: find_ref9._id },
                                                                                 {total_amount: parseFloat( find_paymentref9.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                 const schema9 = new referrals_logModel()
                                                                                  schema9.amount = parseFloat(remaining_refer)
                                                                                  schema9.userId = find_ref9._id
                                                                                  schema9.level = "l9"
                                                                                  schema9.addedBy = find_user._id
                                                                                  schema9.save()
                                                                              }
                                                                                  if(find_ref9.refered_by){
                                                                                    const find_ref10 = await userModel.findOne({referal_id: find_ref9.refered_by});
                                                                                    if(find_ref10){
                                                                                      const find_paymentref10 = await referral_walletModel.findOne({userId: find_ref10._id});
                                                                                      if(find_paymentref10){
                                                                                        if(find_ref10.Addreferral){
                                                                                        const update_ref10payment = await referral_walletModel.findOneAndUpdate(
                                                                                          { userId: find_ref10._id },
                                                                                           {total_amount: parseFloat( find_paymentref10.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                           const schema10 = new referrals_logModel()
                                                                                            schema10.amount = parseFloat(remaining_refer)
                                                                                            schema10.userId = find_ref10._id
                                                                                            schema10.level = "l10"
                                                                                            schema10.addedBy = find_user._id
                                                                                            schema10.save()
                                                                                        }
                                                                                            if(find_ref10.refered_by){
                                                                                              const find_ref11 = await userModel.findOne({referal_id: find_ref10.refered_by});
                                                                                              if(find_ref11){
                                                                                                const find_paymentref11 = await referral_walletModel.findOne({userId: find_ref11._id});
                                                                                                if(find_paymentref11){
                                                                                                  if(find_ref11.Addreferral){
                                                                                                  const update_ref11payment = await referral_walletModel.findOneAndUpdate(
                                                                                                    { userId: find_ref11._id },
                                                                                                     {total_amount: parseFloat( find_paymentref11.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                     const schema11 = new referrals_logModel()
                                                                                                      schema11.amount = parseFloat(remaining_refer)
                                                                                                      schema11.userId = find_ref11._id
                                                                                                      schema11.level = "l11"
                                                                                                      schema11.addedBy = find_user._id
                                                                                                      schema11.save()
                                                                                                  }
                                                                                                      if(find_ref11.refered_by){
                                                                                                        const find_ref12 = await userModel.findOne({referal_id: find_ref11.refered_by});
                                                                                                        if(find_ref12){
                                                                                                          const find_paymentref12 = await referral_walletModel.findOne({userId: find_ref12._id});
                                                                                                          if(find_paymentref12){
                                                                                                            if(find_ref12.Addreferral){
                                                                                                            const update_ref12payment = await referral_walletModel.findOneAndUpdate(
                                                                                                              { userId: find_ref12._id },
                                                                                                               {total_amount: parseFloat( find_paymentref12.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                               const schema12 = new referrals_logModel()
                                                                                                                schema12.amount = parseFloat(remaining_refer)
                                                                                                                schema12.userId = find_ref12._id
                                                                                                                schema12.level = "l12"
                                                                                                                schema12.addedBy = find_user._id
                                                                                                                schema12.save()
                                                                                                            }
                                                                                                                if(find_ref12.refered_by){
                                                                                                                  const find_ref13 = await userModel.findOne({referal_id: find_ref12.refered_by});
                                                                                                                  if(find_ref13){
                                                                                                                    const find_paymentref13 = await referral_walletModel.findOne({userId: find_ref13._id});
                                                                                                                    if(find_paymentref13){
                                                                                                                      if(find_ref13.Addreferral){
                                                                                                                      const update_ref13payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                        { userId: find_ref13._id },
                                                                                                                         {total_amount: parseFloat( find_paymentref13.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                         const schema13 = new referrals_logModel()
                                                                                                                          schema13.amount = parseFloat(remaining_refer)
                                                                                                                          schema13.userId = find_ref13._id
                                                                                                                          schema13.level = "l13"
                                                                                                                          schema13.addedBy = find_user._id
                                                                                                                          schema13.save()
                                                                                                                      }
                                                                                                                          if(find_ref13.refered_by){
                                                                                                                            const find_ref14 = await userModel.findOne({referal_id: find_ref13.refered_by});
                                                                                                                            if(find_ref14){
                                                                                                                              const find_paymentref14 = await referral_walletModel.findOne({userId: find_ref14._id});
                                                                                                                              if(find_paymentref14){
                                                                                                                                if(find_ref14.Addreferral){
                                                                                                                                const update_ref14payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                  { userId: find_ref14._id },
                                                                                                                                   {total_amount: parseFloat( find_paymentref14.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                   const schema14 = new referrals_logModel()
                                                                                                                                    schema14.amount = parseFloat(remaining_refer)
                                                                                                                                    schema14.userId = find_ref14._id
                                                                                                                                    schema14.level = "l14"
                                                                                                                                    schema14.addedBy = find_user._id
                                                                                                                                    schema14.save()
                                                                                                                                }
                                                                                                                                    if(find_ref14.refered_by){
                                                                                                                                      const find_ref15 = await userModel.findOne({referal_id: find_ref14.refered_by});
                                                                                                                                      if(find_ref15){
                                                                                                                                        const find_paymentref15 = await referral_walletModel.findOne({userId: find_ref15._id});
                                                                                                                                        if(find_paymentref15){
                                                                                                                                          if(find_ref15.Addreferral){
                                                                                                                                          const update_ref15payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                            { userId: find_ref15._id },
                                                                                                                                             {total_amount: parseFloat( find_paymentref15.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                             const schema15 = new referrals_logModel()
                                                                                                                                              schema15.amount = parseFloat(remaining_refer)
                                                                                                                                              schema15.userId = find_ref15._id
                                                                                                                                              schema15.level = "l15"
                                                                                                                                              schema15.addedBy = find_user._id
                                                                                                                                              schema15.save()
  
                                                                                                                                          
                                                                                                                                              res.status(200).send({
                                                                                                                                                data: final_deposit,
                                                                                                                                                message: "reinvest successful",
                                                                                                                                                status: 1,
                                                                                                                                                error: null,
                                                                                                                                              });
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                          res.status(200).send({
                                                                                                                                            data: final_deposit,
                                                                                                                                            message: "reinvest successful",
                                                                                                                                            status: 1,
                                                                                                                                            error: null,
                                                                                                                                          });
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                      else {
                                                                                                                                        res.status(200).send({
                                                                                                                                          data: final_deposit,
                                                                                                                                          message: "reinvest successful",
                                                                                                                                          status: 1,
                                                                                                                                          error: null,
                                                                                                                                        });
                                                                                                                                      }
                                                                                                                                     }
                                                                                                                                     else {
                                                                                                                                      res.status(200).send({
                                                                                                                                        data: deposit_log,
                                                                                                                                        message: "reinvest successful",
                                                                                                                                        status: 1,
                                                                                                                                        error: null,
                                                                                                                                      });
                                                                                                                                    }
                                                                                                                              }
                                                                                                                              else {
                                                                                                                                res.status(200).send({
                                                                                                                                  data: deposit_log,
                                                                                                                                  message: "reinvest successful",
                                                                                                                                  status: 1,
                                                                                                                                  error: null,
                                                                                                                                });
                                                                                                                              }
                                                                                                                            }
                                                                                                                            else {
                                                                                                                              res.status(200).send({
                                                                                                                                data: deposit_log,
                                                                                                                                message: "reinvest successful",
                                                                                                                                status: 1,
                                                                                                                                error: null,
                                                                                                                              });
                                                                                                                            }
                                                                                                                           }
                                                                                                                           else {
                                                                                                                            res.status(200).send({
                                                                                                                              data: deposit_log,
                                                                                                                              message: "reinvest successful",
                                                                                                                              status: 1,
                                                                                                                              error: null,
                                                                                                                            });
                                                                                                                          }
                                                                                                                    }
                                                                                                                    else {
                                                                                                                      res.status(200).send({
                                                                                                                        data: deposit_log,
                                                                                                                        message: "reinvest successful",
                                                                                                                        status: 1,
                                                                                                                        error: null,
                                                                                                                      });
                                                                                                                    }
                                                                                                                  }
                                                                                                                  else {
                                                                                                                    res.status(200).send({
                                                                                                                      data: deposit_log,
                                                                                                                      message: "reinvest successful",
                                                                                                                      status: 1,
                                                                                                                      error: null,
                                                                                                                    });
                                                                                                                  }
                                                                                                                 }
                                                                                                                 else {
                                                                                                                  res.status(200).send({
                                                                                                                    data: deposit_log,
                                                                                                                    message: "reinvest successful",
                                                                                                                    status: 1,
                                                                                                                    error: null,
                                                                                                                  });
                                                                                                                }
                                                                                                          }
                                                                                                          else {
                                                                                                            res.status(200).send({
                                                                                                              data: deposit_log,
                                                                                                              message: "reinvest successful",
                                                                                                              status: 1,
                                                                                                              error: null,
                                                                                                            });
                                                                                                          }
                                                                                                        }
                                                                                                        else {
                                                                                                          res.status(200).send({
                                                                                                            data: deposit_log,
                                                                                                            message: "reinvest successful",
                                                                                                            status: 1,
                                                                                                            error: null,
                                                                                                          });
                                                                                                        }
                                                                                                       }
                                                                                                       else {
                                                                                                        res.status(200).send({
                                                                                                          data: deposit_log,
                                                                                                          message: "reinvest successful",
                                                                                                          status: 1,
                                                                                                          error: null,
                                                                                                        });
                                                                                                      }
                                                                                                }
                                                                                                else {
                                                                                                  res.status(200).send({
                                                                                                    data: deposit_log,
                                                                                                    message: "reinvest successful",
                                                                                                    status: 1,
                                                                                                    error: null,
                                                                                                  });
                                                                                                }
                                                                                              }
                                                                                              else {
                                                                                                res.status(200).send({
                                                                                                  data: deposit_log,
                                                                                                  message: "reinvest successful",
                                                                                                  status: 1,
                                                                                                  error: null,
                                                                                                });
                                                                                              }
                                                                                             }
                                                                                             else {
                                                                                              res.status(200).send({
                                                                                                data: deposit_log,
                                                                                                message: "reinvest successful",
                                                                                                status: 1,
                                                                                                error: null,
                                                                                              });
                                                                                            }
                                                                                      }
                                                                                      else {
                                                                                        res.status(200).send({
                                                                                          data: deposit_log,
                                                                                          message: "reinvest successful",
                                                                                          status: 1,
                                                                                          error: null,
                                                                                        });
                                                                                      }
                                                                                    }
                                                                                    else {
                                                                                      res.status(200).send({
                                                                                        data: deposit_log,
                                                                                        message: "reinvest successful",
                                                                                        status: 1,
                                                                                        error: null,
                                                                                      });
                                                                                    }
                                                                                   }
                                                                                   else {
                                                                                    res.status(200).send({
                                                                                      data: deposit_log,
                                                                                      message: "reinvest successful",
                                                                                      status: 1,
                                                                                      error: null,
                                                                                    });
                                                                                  }
                                                                            }
                                                                            else {
                                                                              res.status(200).send({
                                                                                data: deposit_log,
                                                                                message: "reinvest successful",
                                                                                status: 1,
                                                                                error: null,
                                                                              });
                                                                            }
                                                                          }
                                                                          else {
                                                                            res.status(200).send({
                                                                              data: deposit_log,
                                                                              message: "reinvest successful",
                                                                              status: 1,
                                                                              error: null,
                                                                            });
                                                                          }
                                                                         }
                                                                         else {
                                                                          res.status(200).send({
                                                                            data: deposit_log,
                                                                            message: "reinvest successful",
                                                                            status: 1,
                                                                            error: null,
                                                                          });
                                                                        }
                                                                  }
                                                                  else {
                                                                    res.status(200).send({
                                                                      data: deposit_log,
                                                                      message: "reinvest successful",
                                                                      status: 1,
                                                                      error: null,
                                                                    });
                                                                  }
                                                                }
                                                                else {
                                                                  res.status(200).send({
                                                                    data: deposit_log,
                                                                    message: "reinvest successful",
                                                                    status: 1,
                                                                    error: null,
                                                                  });
                                                                }
                                                               }
                                                               else {
                                                                res.status(200).send({
                                                                  data: deposit_log,
                                                                  message: "reinvest successful",
                                                                  status: 1,
                                                                  error: null,
                                                                });
                                                              }
                                                        }
                                                        else {
                                                          res.status(200).send({
                                                            data: deposit_log,
                                                            message: "reinvest successful",
                                                            status: 1,
                                                            error: null,
                                                          });
                                                        }
                                                      }
                                                      else {
                                                        res.status(200).send({
                                                          data: deposit_log,
                                                          message: "reinvest successful",
                                                          status: 1,
                                                          error: null,
                                                        });
                                                      }
                                                     }
                                                     else {
                                                      res.status(200).send({
                                                        data: deposit_log,
                                                        message: "reinvest successful",
                                                        status: 1,
                                                        error: null,
                                                      });
                                                    }
                                              }
                                              else {
                                                res.status(200).send({
                                                  data: deposit_log,
                                                  message: "reinvest successful",
                                                  status: 1,
                                                  error: null,
                                                });
                                              }
                                            }
                                            else {
                                              res.status(200).send({
                                                data: deposit_log,
                                                message: "reinvest successful",
                                                status: 1,
                                                error: null,
                                              });
                                            }
                                           }
                                           else {
                                            res.status(200).send({
                                              data: deposit_log,
                                              message: "reinvest successful",
                                              status: 1,
                                              error: null,
                                            });
                                          }
                                      } else {
                                        res.status(200).send({
                                          data: deposit_log,
                                          message: "reinvest successful",
                                          status: 1,
                                          error: null,
                                        });
                                      }
                                    } else {
                                      res.status(200).send({
                                        data: deposit_log,
                                        message: "reinvest successful",
                                        status: 1,
                                        error: null,
                                      });
                                    }
                                  } else {
                                    res.status(200).send({
                                      data: deposit_log,
                                      message: "reinvest successful",
                                      status: 1,
                                      error: null,
                                    });
                                  }
                                } else {
                                  res.status(200).send({
                                    data: deposit_log,
                                    message: "reinvest successful",
                                    status: 1,
                                    error: null,
                                  });
                                }
                              } else {
                                res.status(200).send({
                                  data: deposit_log,
                                  message: "reinvest successful",
                                  status: 1,
                                  error: null,
                                });
                              }
                            } else {
                              res.status(200).send({
                                data: deposit_log,
                                message: "reinvest successful",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            res.status(200).send({
                              data: deposit_log,
                              message: "reinvest successful",
                              status: 1,
                              error: null,
                            });
                          }
                        } else {
                          res.status(200).send({
                            data: deposit_log,
                            message: "reinvest successful",
                            status: 1,
                            error: null,
                          });
                        }
                      } else {
                        res.status(200).send({
                          data: deposit_log,
                          message: "reinvest successful",
                          status: 1,
                          error: null,
                        });
                      }
                    } else {
                      const schemaref2 = new referral_walletModel();
                      schemaref2.userId = find_ref2._id;
                      schemaref2.total_amount = parseFloat(four_refer);
                      const add_ref2 = await referral_walletModel.create(
                        schemaref2
                      );
                      res.status(200).send({
                        data: deposit_log,
                        message: "reinvest successful",
                        status: 1,
                        error: null,
                      });
                    }
                  } else {
                    res.status(200).send({
                      data: deposit_log,
                      message: "reinvest successful",
                      status: 1,
                      error: null,
                    });
                  }
                } else {
                  res.status(200).send({
                    data: deposit_log,
                    message: "reinvest successful",
                    status: 1,
                    error: null,
                  });
                }
              } else {
                res.status(200).send({
                  data: deposit_log,
                  message: "reinvest successful",
                  status: 1,
                  error: null,
                });
              }
              }else{
              const one_refer = (parseInt(final_deposit) * 5) / 100;
              const four_refer = (parseInt(final_deposit) * 4) / 100;
              const three_refer = (parseInt(final_deposit) * 3) / 100;
              const last_refer = (parseInt(final_deposit) * 1) / 100;
              const two_refer = (parseInt(final_deposit) * 2) / 100;
              const  remaining_refer = (parseInt(final_deposit)*0.25)/100;
              console.log(one_refer, "5%ref");
              console.log(two_refer, "2%ref");
              const find_refpayment = await referral_walletModel.findOne({userId: find_refuser._id});
              if (find_refpayment) {
                if(find_refuser.Addreferral){
                const update_refpayment = await referral_walletModel.findOneAndUpdate(
                  { userId: find_refuser._id },
                  { total_amount: parseFloat(find_refpayment.total_amount) + parseFloat(one_refer)},{ new: true });
                  const schema1 = new referrals_logModel()
                schema1.amount = parseFloat(one_refer)
                schema1.userId = find_refuser._id
                schema1.level = "l1"
                schema1.addedBy = find_user._id
                schema1.save()
                }
                if (find_refuser.refered_by) {
                  const find_ref2 = await userModel.findOne({referal_id: find_refuser.refered_by });
                  if (find_ref2) {
                    const find_paymentref2 = await referral_walletModel.findOne({userId: find_ref2._id});
                    if (find_paymentref2) {
                      if(find_ref2.Addreferral){
                      const update_ref2payment = await referral_walletModel.findOneAndUpdate(
                        { userId: find_ref2._id },
                        { total_amount: parseFloat(find_paymentref2.total_amount) + parseFloat(four_refer),}, 
                        { new: true });
                        const schema2 = new referrals_logModel()
                      schema2.amount = parseFloat(four_refer)
                      schema2.userId = find_ref2._id
                      schema2.level = "l2"
                      schema2.addedBy = find_user._id
                      schema2.save()
                      }
                      if (find_ref2.refered_by) {
                        const find_ref3 = await userModel.findOne({ referal_id: find_ref2.refered_by });
                        if (find_ref3) {
                          const find_paymentref3 = await referral_walletModel.findOne({userId: find_ref3._id});
                          if (find_paymentref3) {
                            if(find_ref3.Addreferral){
                            const update_ref3payment = await referral_walletModel.findOneAndUpdate(
                              { userId: find_ref3._id },
                              { total_amount: parseFloat(find_paymentref3.total_amount) + parseFloat(three_refer), },{ new: true });
                              const schema3 = new referrals_logModel()
                            schema3.amount = parseFloat(three_refer)
                            schema3.userId = find_ref3._id
                            schema3.level = "l3"
                            schema3.addedBy = find_user._id
                            schema3.save()
                            }
                            if (find_ref3.refered_by) {
                              const find_ref4 = await userModel.findOne({ referal_id: find_ref3.refered_by });
                              if (find_ref4) {
                                const find_paymentref4 = await referral_walletModel.findOne({ userId: find_ref4._id});
                                if (find_paymentref4) {
                                  if(find_ref4.Addreferral){
                                  const update_ref4payment = await referral_walletModel.findOneAndUpdate(
                                    { userId: find_ref4._id },
                                     { total_amount: parseFloat(find_paymentref4.total_amount) + parseFloat(two_refer), },{ new: true });const schema4 = new referrals_logModel()
                                     schema4.amount = parseFloat(two_refer)
                                     schema4.userId = find_ref4._id
                                     schema4.level = "l4"
                                     schema4.addedBy = find_user._id
                                     schema4.save()
                                  }
                                  if (find_ref4.refered_by) {
                                    const find_ref5 = await userModel.findOne({referal_id: find_ref4.refered_by});
                                    if (find_ref5) {
                                      const find_paymentref5 = await referral_walletModel.findOne({userId: find_ref5._id});
                                      if (find_paymentref5) {
                                        if(find_ref5.Addreferral){
                                        const update_ref5payment = await referral_walletModel.findOneAndUpdate(
                                          { userId: find_ref5._id },
                                           {total_amount: parseFloat( find_paymentref5.total_amount) + last_refer},{ new: true } );
                                           const schema5 = new referrals_logModel()
                                        schema5.amount = parseFloat(last_refer)
                                        schema5.userId = find_ref5._id
                                        schema5.level = "l5"
                                        schema5.addedBy = find_user._id
                                        schema5.save()
                                        }
                                        if(find_ref5.refered_by){
                                          const find_ref6 = await userModel.findOne({referal_id: find_ref5.refered_by});
                                          if(find_ref6){
                                            const find_paymentref6 = await referral_walletModel.findOne({userId: find_ref6._id});
                                            if(find_paymentref6){
                                              if(find_ref6.Addreferral){
                                              const update_ref6payment = await referral_walletModel.findOneAndUpdate(
                                                { userId: find_ref6._id },
                                                 {total_amount: parseFloat( find_paymentref6.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                 const schema6 = new referrals_logModel()
                                                  schema6.amount = parseFloat(remaining_refer)
                                                  schema6.userId = find_ref6._id
                                                  schema6.level = "l6"
                                                  schema6.addedBy = find_user._id
                                                  schema6.save()
                                              }
                                                  if(find_ref6.refered_by){
                                                    const find_ref7 = await userModel.findOne({referal_id: find_ref6.refered_by});
                                                    if(find_ref7){
                                                      const find_paymentref7 = await referral_walletModel.findOne({userId: find_ref7._id});
                                                      if(find_paymentref7){
                                                        if(find_ref7.Addreferral){
                                                        const update_ref7payment = await referral_walletModel.findOneAndUpdate(
                                                          { userId: find_ref7._id },
                                                           {total_amount: parseFloat( find_paymentref7.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                           const schema7 = new referrals_logModel()
                                                            schema7.amount = parseFloat(remaining_refer)
                                                            schema7.userId = find_ref7._id
                                                            schema7.level = "l7"
                                                            schema7.addedBy = find_user._id
                                                            schema7.save()
                                                        }
                                                            if(find_ref7.refered_by){
                                                              const find_ref8 = await userModel.findOne({referal_id: find_ref7.refered_by});
                                                              if(find_ref8){
                                                                const find_paymentref8 = await referral_walletModel.findOne({userId: find_ref8._id});
                                                                if(find_paymentref8){
                                                                  if(find_ref8.Addreferral){
                                                                  const update_ref8payment = await referral_walletModel.findOneAndUpdate(
                                                                    { userId: find_ref8._id },
                                                                     {total_amount: parseFloat( find_paymentref8.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                     const schema8 = new referrals_logModel()
                                                                      schema8.amount = parseFloat(remaining_refer)
                                                                      schema8.userId = find_ref8._id
                                                                      schema8.level = "l8"
                                                                      schema8.addedBy = find_user._id
                                                                      schema8.save()
                                                                  }
                                                                      if(find_ref8.refered_by){
                                                                        const find_ref9 = await userModel.findOne({referal_id: find_ref8.refered_by});
                                                                        if(find_ref9){
                                                                          const find_paymentref9 = await referral_walletModel.findOne({userId: find_ref9._id});
                                                                          if(find_paymentref9){
                                                                            if(find_ref9.Addreferral){
                                                                            const update_ref9payment = await referral_walletModel.findOneAndUpdate(
                                                                              { userId: find_ref9._id },
                                                                               {total_amount: parseFloat( find_paymentref9.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                               const schema9 = new referrals_logModel()
                                                                                schema9.amount = parseFloat(remaining_refer)
                                                                                schema9.userId = find_ref9._id
                                                                                schema9.level = "l9"
                                                                                schema9.addedBy = find_user._id
                                                                                schema9.save()
                                                                            }
                                                                                if(find_ref9.refered_by){
                                                                                  const find_ref10 = await userModel.findOne({referal_id: find_ref9.refered_by});
                                                                                  if(find_ref10){
                                                                                    const find_paymentref10 = await referral_walletModel.findOne({userId: find_ref10._id});
                                                                                    if(find_paymentref10){
                                                                                      if(find_ref10.Addreferral){
                                                                                      const update_ref10payment = await referral_walletModel.findOneAndUpdate(
                                                                                        { userId: find_ref10._id },
                                                                                         {total_amount: parseFloat( find_paymentref10.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                         const schema10 = new referrals_logModel()
                                                                                          schema10.amount = parseFloat(remaining_refer)
                                                                                          schema10.userId = find_ref10._id
                                                                                          schema10.level = "l10"
                                                                                          schema10.addedBy = find_user._id
                                                                                          schema10.save()
                                                                                      }
                                                                                          if(find_ref10.refered_by){
                                                                                            const find_ref11 = await userModel.findOne({referal_id: find_ref10.refered_by});
                                                                                            if(find_ref11){
                                                                                              const find_paymentref11 = await referral_walletModel.findOne({userId: find_ref11._id});
                                                                                              if(find_paymentref11){
                                                                                                if(find_ref11.Addreferral){
                                                                                                const update_ref11payment = await referral_walletModel.findOneAndUpdate(
                                                                                                  { userId: find_ref11._id },
                                                                                                   {total_amount: parseFloat( find_paymentref11.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                   const schema11 = new referrals_logModel()
                                                                                                    schema11.amount = parseFloat(remaining_refer)
                                                                                                    schema11.userId = find_ref11._id
                                                                                                    schema11.level = "l11"
                                                                                                    schema11.addedBy = find_user._id
                                                                                                    schema11.save()
                                                                                                }
                                                                                                    if(find_ref11.refered_by){
                                                                                                      const find_ref12 = await userModel.findOne({referal_id: find_ref11.refered_by});
                                                                                                      if(find_ref12){
                                                                                                        const find_paymentref12 = await referral_walletModel.findOne({userId: find_ref12._id});
                                                                                                        if(find_paymentref12){
                                                                                                          if(find_ref12.Addreferral){
                                                                                                          const update_ref12payment = await referral_walletModel.findOneAndUpdate(
                                                                                                            { userId: find_ref12._id },
                                                                                                             {total_amount: parseFloat( find_paymentref12.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                             const schema12 = new referrals_logModel()
                                                                                                              schema12.amount = parseFloat(remaining_refer)
                                                                                                              schema12.userId = find_ref12._id
                                                                                                              schema12.level = "l12"
                                                                                                              schema12.addedBy = find_user._id
                                                                                                              schema12.save()
                                                                                                          }
                                                                                                              if(find_ref12.refered_by){
                                                                                                                const find_ref13 = await userModel.findOne({referal_id: find_ref12.refered_by});
                                                                                                                if(find_ref13){
                                                                                                                  const find_paymentref13 = await referral_walletModel.findOne({userId: find_ref13._id});
                                                                                                                  if(find_paymentref13){
                                                                                                                    if(find_ref13.Addreferral){
                                                                                                                    const update_ref13payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                      { userId: find_ref13._id },
                                                                                                                       {total_amount: parseFloat( find_paymentref13.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                       const schema13 = new referrals_logModel()
                                                                                                                        schema13.amount = parseFloat(remaining_refer)
                                                                                                                        schema13.userId = find_ref13._id
                                                                                                                        schema13.level = "l13"
                                                                                                                        schema13.addedBy = find_user._id
                                                                                                                        schema13.save()
                                                                                                                    }
                                                                                                                        if(find_ref13.refered_by){
                                                                                                                          const find_ref14 = await userModel.findOne({referal_id: find_ref13.refered_by});
                                                                                                                          if(find_ref14){
                                                                                                                            const find_paymentref14 = await referral_walletModel.findOne({userId: find_ref14._id});
                                                                                                                            if(find_paymentref14){
                                                                                                                              if(find_ref14.Addreferral){
                                                                                                                              const update_ref14payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                { userId: find_ref14._id },
                                                                                                                                 {total_amount: parseFloat( find_paymentref14.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                 const schema14 = new referrals_logModel()
                                                                                                                                  schema14.amount = parseFloat(remaining_refer)
                                                                                                                                  schema14.userId = find_ref14._id
                                                                                                                                  schema14.level = "l14"
                                                                                                                                  schema14.addedBy = find_user._id
                                                                                                                                  schema14.save()
                                                                                                                              }
                                                                                                                                  if(find_ref14.refered_by){
                                                                                                                                    const find_ref15 = await userModel.findOne({referal_id: find_ref14.refered_by});
                                                                                                                                    if(find_ref15){
                                                                                                                                      const find_paymentref15 = await referral_walletModel.findOne({userId: find_ref15._id});
                                                                                                                                      if(find_paymentref15){
                                                                                                                                        if(find_ref15.Addreferral){
                                                                                                                                        const update_ref15payment = await referral_walletModel.findOneAndUpdate(
                                                                                                                                          { userId: find_ref15._id },
                                                                                                                                           {total_amount: parseFloat( find_paymentref15.total_amount) + parseFloat(remaining_refer)},{ new: true } );
                                                                                                                                           const schema15 = new referrals_logModel()
                                                                                                                                            schema15.amount = parseFloat(remaining_refer)
                                                                                                                                            schema15.userId = find_ref15._id
                                                                                                                                            schema15.level = "l15"
                                                                                                                                            schema15.addedBy = find_user._id
                                                                                                                                            schema15.save()
                                                                                                                                        }
                                                                                                                                            res.status(200).send({
                                                                                                                                              data: deposit_log,
                                                                                                                                              message: "reinvest successful",
                                                                                                                                              status: 1,
                                                                                                                                              error: null,
                                                                                                                                            });
                                                                                                                                      }
                                                                                                                                      else {
                                                                                                                                        res.status(200).send({
                                                                                                                                          data: deposit_log,
                                                                                                                                          message: "reinvest successful",
                                                                                                                                          status: 1,
                                                                                                                                          error: null,
                                                                                                                                        });
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                    else {
                                                                                                                                      res.status(200).send({
                                                                                                                                        data: deposit_log,
                                                                                                                                        message: "reinvest successful",
                                                                                                                                        status: 1,
                                                                                                                                        error: null,
                                                                                                                                      });
                                                                                                                                    }
                                                                                                                                   }
                                                                                                                                   else {
                                                                                                                                    res.status(200).send({
                                                                                                                                      data: deposit_log,
                                                                                                                                      message: "reinvest successful",
                                                                                                                                      status: 1,
                                                                                                                                      error: null,
                                                                                                                                    });
                                                                                                                                  }
                                                                                                                            }
                                                                                                                            else {
                                                                                                                              res.status(200).send({
                                                                                                                                data: deposit_log,
                                                                                                                                message: "reinvest successful",
                                                                                                                                status: 1,
                                                                                                                                error: null,
                                                                                                                              });
                                                                                                                            }
                                                                                                                          }
                                                                                                                          else {
                                                                                                                            res.status(200).send({
                                                                                                                              data: deposit_log,
                                                                                                                              message: "reinvest successful",
                                                                                                                              status: 1,
                                                                                                                              error: null,
                                                                                                                            });
                                                                                                                          }
                                                                                                                         }
                                                                                                                         else {
                                                                                                                          res.status(200).send({
                                                                                                                            data: deposit_log,
                                                                                                                            message: "reinvest successful",
                                                                                                                            status: 1,
                                                                                                                            error: null,
                                                                                                                          });
                                                                                                                        }
                                                                                                                  }
                                                                                                                  else {
                                                                                                                    res.status(200).send({
                                                                                                                      data: deposit_log,
                                                                                                                      message: "reinvest successful",
                                                                                                                      status: 1,
                                                                                                                      error: null,
                                                                                                                    });
                                                                                                                  }
                                                                                                                }
                                                                                                                else {
                                                                                                                  res.status(200).send({
                                                                                                                    data: deposit_log,
                                                                                                                    message: "reinvest successful",
                                                                                                                    status: 1,
                                                                                                                    error: null,
                                                                                                                  });
                                                                                                                }
                                                                                                               }
                                                                                                               else {
                                                                                                                res.status(200).send({
                                                                                                                  data: deposit_log,
                                                                                                                  message: "reinvest successful",
                                                                                                                  status: 1,
                                                                                                                  error: null,
                                                                                                                });
                                                                                                              }
                                                                                                        }
                                                                                                        else {
                                                                                                          res.status(200).send({
                                                                                                            data: deposit_log,
                                                                                                            message: "reinvest successful",
                                                                                                            status: 1,
                                                                                                            error: null,
                                                                                                          });
                                                                                                        }
                                                                                                      }
                                                                                                      else {
                                                                                                        res.status(200).send({
                                                                                                          data: deposit_log,
                                                                                                          message: "reinvest successful",
                                                                                                          status: 1,
                                                                                                          error: null,
                                                                                                        });
                                                                                                      }
                                                                                                     }
                                                                                                     else {
                                                                                                      res.status(200).send({
                                                                                                        data: deposit_log,
                                                                                                        message: "reinvest successful",
                                                                                                        status: 1,
                                                                                                        error: null,
                                                                                                      });
                                                                                                    }
                                                                                              }
                                                                                              else {
                                                                                                res.status(200).send({
                                                                                                  data: deposit_log,
                                                                                                  message: "reinvest successful",
                                                                                                  status: 1,
                                                                                                  error: null,
                                                                                                });
                                                                                              }
                                                                                            }
                                                                                            else {
                                                                                              res.status(200).send({
                                                                                                data: deposit_log,
                                                                                                message: "reinvest successful",
                                                                                                status: 1,
                                                                                                error: null,
                                                                                              });
                                                                                            }
                                                                                           }
                                                                                           else {
                                                                                            res.status(200).send({
                                                                                              data: deposit_log,
                                                                                              message: "reinvest successful",
                                                                                              status: 1,
                                                                                              error: null,
                                                                                            });
                                                                                          }
                                                                                    }
                                                                                    else {
                                                                                      res.status(200).send({
                                                                                        data: deposit_log,
                                                                                        message: "reinvest successful",
                                                                                        status: 1,
                                                                                        error: null,
                                                                                      });
                                                                                    }
                                                                                  }
                                                                                  else {
                                                                                    res.status(200).send({
                                                                                      data: deposit_log,
                                                                                      message: "reinvest successful",
                                                                                      status: 1,
                                                                                      error: null,
                                                                                    });
                                                                                  }
                                                                                 }
                                                                                 else {
                                                                                  res.status(200).send({
                                                                                    data: deposit_log,
                                                                                    message: "reinvest successful",
                                                                                    status: 1,
                                                                                    error: null,
                                                                                  });
                                                                                }
                                                                          }
                                                                          else {
                                                                            res.status(200).send({
                                                                              data: deposit_log,
                                                                              message: "reinvest successful",
                                                                              status: 1,
                                                                              error: null,
                                                                            });
                                                                          }
                                                                        }
                                                                        else {
                                                                          res.status(200).send({
                                                                            data: deposit_log,
                                                                            message: "reinvest successful",
                                                                            status: 1,
                                                                            error: null,
                                                                          });
                                                                        }
                                                                       }
                                                                       else {
                                                                        res.status(200).send({
                                                                          data: deposit_log,
                                                                          message: "reinvest successful",
                                                                          status: 1,
                                                                          error: null,
                                                                        });
                                                                      }
                                                                }
                                                                else {
                                                                  res.status(200).send({
                                                                    data: deposit_log,
                                                                    message: "reinvest successful",
                                                                    status: 1,
                                                                    error: null,
                                                                  });
                                                                }
                                                              }
                                                              else {
                                                                res.status(200).send({
                                                                  data: deposit_log,
                                                                  message: "reinvest successful",
                                                                  status: 1,
                                                                  error: null,
                                                                });
                                                              }
                                                             }
                                                             else {
                                                              res.status(200).send({
                                                                data: deposit_log,
                                                                message: "reinvest successful",
                                                                status: 1,
                                                                error: null,
                                                              });
                                                            }
                                                      }
                                                      else {
                                                        res.status(200).send({
                                                          data: deposit_log,
                                                          message: "reinvest successful",
                                                          status: 1,
                                                          error: null,
                                                        });
                                                      }
                                                    }
                                                    else {
                                                      res.status(200).send({
                                                        data: deposit_log,
                                                        message: "reinvest successful",
                                                        status: 1,
                                                        error: null,
                                                      });
                                                    }
                                                   }
                                                   else {
                                                    res.status(200).send({
                                                      data: deposit_log,
                                                      message: "reinvest successful",
                                                      status: 1,
                                                      error: null,
                                                    });
                                                  }
                                            }
                                            else {
                                              res.status(200).send({
                                                data: deposit_log,
                                                message: "reinvest successful",
                                                status: 1,
                                                error: null,
                                              });
                                            }
                                          }
                                          else {
                                            res.status(200).send({
                                              data: deposit_log,
                                              message: "reinvest successful",
                                              status: 1,
                                              error: null,
                                            });
                                          }
                                         }
                                         else {
                                          res.status(200).send({
                                            data: deposit_log,
                                            message: "reinvest successful",
                                            status: 1,
                                            error: null,
                                          });
                                        }
                                      } else {
                                        res.status(200).send({
                                          data: deposit_log,
                                          message: "reinvest successful",
                                          status: 1,
                                          error: null,
                                        });
                                      }
                                    } else {
                                      res.status(200).send({
                                        data: deposit_log,
                                        message: "reinvest successful",
                                        status: 1,
                                        error: null,
                                      });
                                    }
                                  } else {
                                    res.status(200).send({
                                      data: deposit_log,
                                      message: "reinvest successful",
                                      status: 1,
                                      error: null,
                                    });
                                  }
                                } else {
                                  res.status(200).send({
                                    data: deposit_log,
                                    message: "reinvest successful",
                                    status: 1,
                                    error: null,
                                  });
                                }
                              } else {
                                res.status(200).send({
                                  data: deposit_log,
                                  message: "reinvest successful",
                                  status: 1,
                                  error: null,
                                });
                              }
                            } else {
                              res.status(200).send({
                                data: deposit_log,
                                message: "reinvest successful",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            res.status(200).send({
                              data: deposit_log,
                              message: "reinvest successful",
                              status: 1,
                              error: null,
                            });
                          }
                        } else {
                          res.status(200).send({
                            data: deposit_log,
                            message: "reinvest successful",
                            status: 1,
                            error: null,
                          });
                        }
                      } else {
                        res.status(200).send({
                          data: deposit_log,
                          message: "reinvest successful",
                          status: 1,
                          error: null,
                        });
                      }
                    } else {
                      res.status(200).send({
                        data: deposit_log,
                        message: "reinvest successful",
                        status: 1,
                        error: null,
                      });
                    }
                  } else {
                    res.status(200).send({
                      data: deposit_log,
                      message: "reinvest successful",
                      status: 1,
                      error: null,
                    });
                  }
                } else {
                  res.status(200).send({
                    data: deposit_log,
                    message: "reinvest successful",
                    status: 1,
                    error: null,
                  });
                }
              } else {
                res.status(200).send({
                  data: deposit_log,
                  message: "reinvest successful",
                  status: 1,
                  error: null,
                });
              }
            }
            } else {
              res.status(200).send({
                data: deposit_log,
                message: "reinvest successful",
                status: 1,
                error: null,
              });
            }
          } else {
            res.status(200).send({
              status: 1,
              message: "reinvest successful",
            });
          }
          // res.status(200).send({
          //   status: 1,
          //   message: "reinvest successful",
          // });
    
        } else {
          const schema_main = new paymentModel();
          schema_main.userId = req.body.UserId;
          schema_main.total_amount = final_deposit;
          schema_main.crypto = parseFloat(total_ggo);
          const create_payment = await paymentModel.create(schema_main);
          // res.status(200).send({
          //   status: 1,
          //   message: "reinvest successful",
          // });
        }
      // }
  
      // else if(req.body.wallet_type == "stake"){
      //   const find_intrest = await stake_interest_walletModel.findOne({UserId: req.body.UserId,});
      //   const find_referral_earnings = await stake_referral_walletModel.findOne({userId: req.body.UserId, });
      //   const find_net_staking = await stake_nsr_walletModel.findOne({UserId: req.body.UserId,});
      //   console.log(find_intrest, "find_intrest");
      //   console.log(find_referral_earnings, "find_referral_earnings");
      //   console.log(find_net_staking, "find_net_staking");

      //   const total_withdrawal = parseFloat(find_intrest.total_amount) + parseFloat(find_referral_earnings.total_amount) + parseFloat(find_net_staking.total_amount);
      //   console.log(total_withdrawal, "total_withdrawal");
      //   const total_amount = req.body.amount;
      //   const percentage = req.body.percentage;
      //   const final_deposit = (total_withdrawal * percentage) / 100;
      //   console.log(final_deposit, "data");
      //   const value_intrest = find_intrest.total_amount - (find_intrest.total_amount * percentage) / 100;
      //   const value_referral = find_referral_earnings.total_amount -(find_referral_earnings.total_amount * percentage) / 100;
      //   const value_staking = find_net_staking.total_amount - (find_net_staking.total_amount * percentage) / 100;
      //   console.log(value_intrest, "value_intrest");
      //   console.log(value_referral, "value_referral");
      //   console.log(value_staking, "value_staking");
      //   const update_interest_wallet = await stake_interest_walletModel.findOneAndUpdate({ UserId: req.body.UserId },{ total_amount: value_intrest,}, { new: true });
      //   const update_referral_wallet = await stake_referral_walletModel.findOneAndUpdate( { userId: req.body.UserId }, { total_amount: value_referral, }, { new: true });
      //   const update_net_staking = await stake_nsr_walletModel.findOneAndUpdate({ UserId: req.body.UserId }, { total_amount: value_staking,}, { new: true } );
      //   console.log(update_interest_wallet, "update_interest_wallet");
      //   console.log(update_referral_wallet, "update_referral_wallet");
      //   console.log(update_net_staking, "update_net_staking");
      //   const random_number1 = otpGenerator.generate(5, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false,});
      //   const price = await axios.get("https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b" );
      //   console.log(price.data.pairs[0].priceUsd, "prices");
      //   const GGO_usd = price.data.pairs[0].priceUsd;
      //   // const options = {
      //   //   method: "GET",
      //   //   url: "https://fixer-fixer-currency-v1.p.rapidapi.com/latest",
      //   //   params: { base: "USD", symbols: "INR" },
      //   //   headers: {
      //   //     "X-RapidAPI-Host": "fixer-fixer-currency-v1.p.rapidapi.com",
      //   //     "X-RapidAPI-Key":
      //   //       "a4c4b5a3e8mshef2c08699c04517p1025ffjsn259a25360ea0",
      //   //   },
      //   // };
      //   // const currency_data = await axios.request(options);
      //   const currency_value = 77.96;
      //   console.log(currency_value, "currency_value");
      //   const GGO_inr = parseFloat(currency_value * GGO_usd);
      //   console.log(GGO_inr, "GGO_inr");
      //   const total_ggo = final_deposit / GGO_inr;
      //   console.log(total_ggo, "total_ggo");
      //   console.log(req.body.UserId, "userId");
      //   const random_number = otpGenerator.generate(20, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: true,});
      //   const OrderId = "order_" + random_number;
      //   const transaction_id = otpGenerator.generate(6, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false});
      //   const schema = new deposit_logModel();
      //   schema.userId = req.body.UserId;
      //   schema.crypto = total_ggo;
      //   schema.holding_price = GGO_inr;
      //   schema.staking_id = random_number1;
      //   schema.orderId = OrderId;
      //   schema.amount = final_deposit;
      //   schema.paymentCompleted = true;
      //   schema.currencyType = "INR";
      //   schema.paymentType = "Reinvest";
      //   schema.status = "Success";
      //   schema.wallet_type = req.body.wallet_type;
      //   const deposit_log = await deposit_logModel.create(schema);
      //   console.log(deposit_log, "deposit");
      //   const find_payment = await stake_deposit_walletModel.findOne({userId: req.body.UserId });
      //   const interest_schema = new interest_withdraw_logModel()
      //   interest_schema.userId = req.body.UserId
      //   interest_schema.amount = (find_intrest.total_amount * percentage) / 100;
      //   interest_schema.percentage = percentage
      //   interest_schema.reinvest_id = deposit_log._id
      //   interest_schema.wallet_type = req.body.wallet_type
      //   const create_interest_log = await interest_withdraw_logModel.create(interest_schema);
      //   const referral_schema = new referral_withdraw_logModel()
      //   referral_schema.userId = req.body.UserId
      //   referral_schema.amount = (find_referral_earnings.total_amount * percentage) / 100;
      //   referral_schema.percentage = percentage
      //   referral_schema.reinvest_id = deposit_log._id
      //   referral_schema.wallet_type = req.body.wallet_type
      //   const create_referral_log = await referral_withdraw_logModel.create(referral_schema);
      //   const netstaking_schema = new net_staking_withdrawal_logModel()
      //   netstaking_schema.userId = req.body.UserId
      //   netstaking_schema.amount = (find_net_staking.total_amount * percentage) / 100;
      //   netstaking_schema.percentage = percentage
      //   netstaking_schema.reinvest_id = deposit_log._id
      //   netstaking_schema.wallet_type = req.body.wallet_type
      //   const create_netstaking_log = await net_staking_withdrawal_logModel.create(netstaking_schema);
          
      //   // checking interest
      //   var weekly_pr;
      //   var annual_pr;
      //   var monthly_pr;
      
      //   if (final_deposit <= 10000) {
      //     weekly_pr = 0.339;
      //     annual_pr = 17.65;
      //     monthly_pr = 1.358;
      //   } else if (final_deposit <= 20000) {
      //     weekly_pr = 0.341;
      //     annual_pr = 17.75;
      //     monthly_pr = 1.365;
      //   } else if (final_deposit <= 30000) {
      //     weekly_pr = 0.343;
      //     annual_pr = 17.85;
      //     monthly_pr = 1.373;
      //   } else if (final_deposit <= 40000) {
      //     weekly_pr = 0.345;
      //     annual_pr = 17.95;
      //     monthly_pr = 1.381;
      //   } else if (final_deposit <= 50000) {
      //     weekly_pr = 0.347;
      //     annual_pr = 18.05;
      //     monthly_pr = 1.388;
      //   } else if (final_deposit <= 60000) {
      //     weekly_pr = 0.349;
      //     annual_pr = 18.15;
      //     monthly_pr = 1.396;
      //   } else if (final_deposit <= 70000) {
      //     weekly_pr = 0.351;
      //     annual_pr = 18.25;
      //     monthly_pr = 1.404;
      //   } else if (final_deposit <= 80000) {
      //     weekly_pr = 0.353;
      //     annual_pr = 18.35;
      //     monthly_pr = 1.412;
      //   } else if (final_deposit <= 90000) {
      //     weekly_pr = 0.355;
      //     annual_pr = 18.45;
      //     monthly_pr = 1.419;
      //   } else if (final_deposit <= 100000) {
      //     weekly_pr = 0.357;
      //     annual_pr = 18.55;
      //     monthly_pr = 1.427;
      //   } else if (final_deposit <= 110000) {
      //     weekly_pr = 0.359;
      //     annual_pr = 18.65;
      //     monthly_pr = 1.435;
      //   } else if (final_deposit <= 120000) {
      //     weekly_pr = 0.361;
      //     annual_pr = 18.75;
      //     monthly_pr = 1.442;
      //   } else if (final_deposit <= 130000) {
      //     weekly_pr = 0.363;
      //     annual_pr = 18.85;
      //     monthly_pr = 1.450;
      //   } else if (final_deposit <= 140000) {
      //     weekly_pr = 0.364;
      //     annual_pr = 18.95;
      //     monthly_pr = 1.458;
      //   } else if (final_deposit <= 150000) {
      //     weekly_pr = 0.366;
      //     annual_pr = 19.05;
      //     monthly_pr = 1.465;
      //   } else if (final_deposit <= 160000) {
      //     weekly_pr = 0.368;
      //     annual_pr = 19.15;
      //     monthly_pr = 1.473;
      //   } else if (final_deposit <= 170000) {
      //     weekly_pr = 0.370;
      //     annual_pr = 19.25;
      //     monthly_pr = 1.481;
      //   } else if (final_deposit <= 180000) {
      //     weekly_pr = 0.372;
      //     annual_pr = 19.35;
      //     monthly_pr = 1.488;
      //   } else if (final_deposit <= 190000) {
      //     weekly_pr = 0.374;
      //     annual_pr = 19.45;
      //     monthly_pr = 1.496;
      //   } else if (final_deposit <= 200000) {
      //     weekly_pr = 0.376;
      //     annual_pr = 19.55;
      //     monthly_pr = 1.504;
      //   } else if (final_deposit <= 210000) {
      //     weekly_pr = 0.376;
      //     annual_pr = 19.55;
      //     monthly_pr = 1.504;
      //   } else if (final_deposit <= 220000) {
      //     weekly_pr = 0.380;
      //     annual_pr = 19.75;
      //     monthly_pr = 1.519;
      //   } else if (final_deposit <= 230000) {
      //     weekly_pr = 0.382;
      //     annual_pr = 19.85;
      //     monthly_pr = 1.527;
      //   } else if (final_deposit <= 240000) {
      //     weekly_pr = 0.384;
      //     annual_pr = 19.95;
      //     monthly_pr = 1.535;
      //   } else if (final_deposit <= 250000) {
      //     weekly_pr = 0.386;
      //     annual_pr = 20.05;
      //     monthly_pr = 1.542;
      //   } else if (final_deposit <= 260000) {
      //     weekly_pr = 0.388;
      //     annual_pr = 20.15;
      //     monthly_pr = 1.550;
      //   } else if (final_deposit <= 270000) {
      //     weekly_pr = 0.389;
      //     annual_pr = 20.25;
      //     monthly_pr = 1.558;
      //   } else if (final_deposit <= 280000) {
      //     weekly_pr = 0.391;
      //     annual_pr = 20.35;
      //     monthly_pr = 1.565;
      //   } else if (final_deposit <= 290000) {
      //     weekly_pr = 0.393;
      //     annual_pr = 20.45;
      //     monthly_pr = 1.573;
      //   } else if (final_deposit <= 300000) {
      //     weekly_pr = 0.395;
      //     annual_pr = 20.55;
      //     monthly_pr = 1.581;
      //   } else if (final_deposit <= 310000) {
      //     weekly_pr = 0.397;
      //     annual_pr = 20.65;
      //     monthly_pr = 1.588;
      //   } else if (final_deposit <= 320000) {
      //     weekly_pr = 0.399;
      //     annual_pr = 20.75;
      //     monthly_pr = 1.596;
      //   } else if (final_deposit <= 330000) {
      //     weekly_pr = 0.401;
      //     annual_pr = 20.85;
      //     monthly_pr = 1.604;
      //   } else if (final_deposit <= 340000) {
      //     weekly_pr = 0.403;
      //     annual_pr = 20.95;
      //     monthly_pr = 1.612;
      //   } else if (final_deposit <= 350000) {
      //     weekly_pr = 0.405;
      //     annual_pr = 21.05;
      //     monthly_pr = 1.619;
      //   } else if (final_deposit <= 360000) {
      //     weekly_pr = 0.407;
      //     annual_pr = 21.15;
      //     monthly_pr = 1.627;
      //   } else if (final_deposit <= 370000) {
      //     weekly_pr = 0.409;
      //     annual_pr = 21.25;
      //     monthly_pr = 1.635;
      //   } else if (final_deposit <= 380000) {
      //     weekly_pr = 0.411;
      //     annual_pr = 21.35;
      //     monthly_pr = 1.642;
      //   } else if (final_deposit <= 390000) {
      //     weekly_pr = 0.413;
      //     annual_pr = 21.45;
      //     monthly_pr = 1.650;
      //   } else if (final_deposit <= 400000) {
      //     weekly_pr = 0.414;
      //     annual_pr = 21.55;
      //     monthly_pr = 1.658;
      //   } else if (final_deposit <= 410000) {
      //     weekly_pr = 0.416;
      //     annual_pr = 21.65;
      //     monthly_pr = 1.665;
      //   } else if (final_deposit <= 420000) {
      //     weekly_pr = 0.418;
      //     annual_pr = 21.75;
      //     monthly_pr = 1.673;
      //   } else if (final_deposit <= 430000) {
      //     weekly_pr = 0.420;
      //     annual_pr = 21.85;
      //     monthly_pr = 1.681;
      //   } else if (final_deposit <= 440000) {
      //     weekly_pr = 0.422;
      //     annual_pr = 21.95;
      //     monthly_pr = 1.688;
      //   } else if (final_deposit <= 450000) {
      //     weekly_pr = 0.424;
      //     annual_pr = 22.05;
      //     monthly_pr = 1.696;
      //   } else if (final_deposit <= 460000) {
      //     weekly_pr = 0.426;
      //     annual_pr = 22.15;
      //     monthly_pr = 1.704;
      //   } else if (final_deposit <= 470000) {
      //     weekly_pr = 0.428;
      //     annual_pr = 22.25;
      //     monthly_pr = 1.712;
      //   } else if (final_deposit <= 480000) {
      //     weekly_pr = 0.430;
      //     annual_pr = 22.35;
      //     monthly_pr = 1.719;
      //   } else if (final_deposit <= 490000) {
      //     weekly_pr = 0.432;
      //     annual_pr = 22.45;
      //     monthly_pr = 1.727;
      //   } else if (final_deposit <= 500000) {
      //     weekly_pr = 0.434;
      //     annual_pr = 22.55;
      //     monthly_pr = 1.735;
      //   } else if (final_deposit <= 600000) {
      //     weekly_pr = 0.436;
      //     annual_pr = 22.65;
      //     monthly_pr = 1.742;
      //   } else if (final_deposit <= 700000) {
      //     weekly_pr = 0.438;
      //     annual_pr = 22.75;
      //     monthly_pr = 1.750;
      //   } else if (final_deposit <= 800000) {
      //     weekly_pr = 0.439;
      //     annual_pr = 22.85;
      //     monthly_pr = 1.758;
      //   } else if (final_deposit <= 900000) {
      //     weekly_pr = 0.441;
      //     annual_pr = 22.95;
      //     monthly_pr = 1.765;
      //   } else if (final_deposit <= 1000000) {
      //     weekly_pr = 0.445;
      //     annual_pr = 23.15;
      //     monthly_pr = 1.781;
      //   } else if (final_deposit <= 1500000) {
      //     weekly_pr = 0.447;
      //     annual_pr = 23.25;
      //     monthly_pr = 1.788;
      //   } else if (final_deposit <= 2000000) {
      //     weekly_pr = 0.449;
      //     annual_pr = 23.35;
      //     monthly_pr = 1.796;
      //   } else if (final_deposit <= 2500000) {
      //     weekly_pr = 0.451;
      //     annual_pr = 23.45;
      //     monthly_pr = 1.804;
      //   } else if (final_deposit <= 3000000) {
      //     weekly_pr = 0.453;
      //     annual_pr = 23.55;
      //     monthly_pr = 1.812;
      //   } else if (final_deposit <= 3500000) {
      //     weekly_pr = 0.455;
      //     annual_pr = 23.65;
      //     monthly_pr = 1.819;
      //   } else if (final_deposit <= 4000000) {
      //     weekly_pr = 0.457;
      //     annual_pr = 23.75;
      //     monthly_pr = 1.827;
      //   } else if (final_deposit <= 4500000) {
      //     weekly_pr = 0.459;
      //     annual_pr = 23.65;
      //     monthly_pr = 1.835;
      //   }else if (final_deposit <= 5100000) {
      //     weekly_pr = 0.462;
      //     annual_pr = 23.55;
      //     monthly_pr = 1.846;
      //   }

      //   const weekly_payout = (weekly_pr * final_deposit) / 100;
      //   const monthly_payout = (monthly_pr * final_deposit) / 100;
      //   const annual_payout = (annual_pr * final_deposit) / 100;
      //   // end checking interest

      //   // interest adding
      //   const d = new Date();
      //   let day = d.getDay();
      //   let month = d.getMonth();
      //   let date = d.getDate();
      //   let hour = d.getHours();
      //   let min = d.getMinutes();
      //   // if (req.body.interest_type == "weekly") {
      //   //   console.log(deposit_log.userId, "id");
      //   //   const schema1 = new intrest_historyModel();
      //   //   schema1.UserId = deposit_log.userId;
      //   //   schema1.deposit_id = deposit_log._id;
      //   //   schema1.transaction_id = transaction_id;
      //   //   schema1.staking_id = deposit_log.staking_id;
      //   //   schema1.intrest_amount = parseFloat(weekly_payout);
      //   //   schema1.amount = final_deposit;
      //   //   schema1.status = true;
      //   //   schema1.interest_percentage = weekly_pr;
      //   //   schema1.day = day;
      //   //   schema1.hours = hour;
      //   //   schema1.minute = min;
      //   //   schema1.interest_type = "weekly";
      //   //   schema1.wallet_type = req.body.wallet_type
      //   //   const create_history = await intrest_historyModel.create(schema1);
      //   //   console.log(create_history, "create_history");
      //   //   schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
      //   //     const schema = new interest_logModel();
      //   //     schema.UserId = deposit_log.userId;
      //   //     schema.interest_amount = parseFloat(weekly_payout);
      //   //     schema.status = "success";
      //   //     schema.payment_completed = true;
      //   //     schema.intrest_type = "weekly";
      //   //     schema.hours = hour;
      //   //     schema.day = day;
      //   //     schema.minute = min;
      //   //     schema.wallet_type = req.body.wallet_type
      //   //     const create_interest = await interest_logModel.create(schema);
      //   //     const find_interest_wallet = await stake_interest_walletModel.findOne({
      //   //       UserId: deposit_log.userId,
      //   //     });
      //   //     if (find_interest_wallet) {
      //   //       const update_interest_wallet =
      //   //         await stake_interest_walletModel.findOneAndUpdate(
      //   //           { UserId: deposit_log.userId },
      //   //           {
      //   //             total_amount:
      //   //               parseFloat(find_interest_wallet.total_amount) +
      //   //               parseFloat(weekly_payout),
      //   //           },
      //   //           { new: true }
      //   //         );
      //   //     } else {
      //   //       const schema1 = new stake_interest_walletModel();
      //   //       schema1.UserId = deposit_log.userId;
      //   //       schema1.total_amount = parseFloat(weekly_payout);
      //   //       const create_interest_wallet = await stake_interest_walletModel.create(
      //   //         schema1
      //   //       );
      //   //     }
      //   //   });
      //   // }
      //   // if (req.body.interest_type == "monthly") {
      //     const schema1 = new intrest_historyModel();
      //     schema1.UserId = deposit_log.userId;
      //     schema1.deposit_id = deposit_log._id;
      //     schema1.transaction_id = transaction_id;
      //     schema1.staking_id = deposit_log.staking_id;
      //     schema1.intrest_amount = parseFloat(monthly_payout);
      //     schema1.amount = final_deposit;
      //     schema1.status = true;
      //     schema1.interest_percentage = monthly_pr;
      //     schema1.date = date;
      //     schema1.hours = hour;
      //     schema1.minute = min;
      //     schema1.interest_type = "monthly";
      //     schema1.wallet_type = req.body.wallet_type;
      //     const create_history = await intrest_historyModel.create(schema1);
      //     console.log(create_history, "create_history");
      //     schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
      //       const schema = new interest_logModel();
      //       schema.UserId = deposit_log.userId;
      //       schema.interest_amount = parseFloat(monthly_payout);
      //       schema.status = "success";
      //       schema.payment_completed = true;
      //       schema.intrest_type = "monthly";
      //       schema.hours = hour;
      //       schema.date = date;
      //       schema.minute = min;
      //       schema.wallet_type = req.body.wallet_type;
      //       const create_interest = await interest_logModel.create(schema);
      //       const find_interest_wallet = await stake_interest_walletModel.findOne({ UserId: deposit_log.userId });
      //       if (find_interest_wallet) {
      //         const update_interest_wallet = await stake_interest_walletModel.findOneAndUpdate({ UserId: deposit_log.userId },{total_amount: parseFloat(find_interest_wallet.total_amount) + parseFloat(monthly_payout) },{ new: true });
      //       } else {
      //         const schema1 = new stake_interest_walletModel();
      //         schema1.UserId = deposit_log.userId;
      //         schema1.total_amount = parseFloat(monthly_payout);
      //         const create_interest_wallet = await stake_interest_walletModel.create(schema1);
      //       }
      //     });
      //   // } 
      //   // else if (req.body.interest_type == "yearly") {
      //   //   const schema1 = new intrest_historyModel();
      //   //   schema1.UserId = deposit_log.userId;
      //   //   schema1.deposit_id = deposit_log._id;
      //   //   schema1.transaction_id = transaction_id;
      //   //   schema1.staking_id = deposit_log.staking_id;
      //   //   schema1.intrest_amount = parseFloat(annual_payout);
      //   //   schema1.amount = final_deposit;
      //   //   schema1.status = true;
      //   //   schema1.interest_percentage = annual_pr;
      //   //   schema1.month = month;
      //   //   schema1.date = date;
      //   //   schema1.hours = hour;
      //   //   schema1.minute = min;
      //   //   schema1.interest_type = "yearly";
      //   //   schema1.wallet_type = req.body.wallet_type;
      //   //   const create_history = await intrest_historyModel.create(schema1);
      //   //   console.log(create_history, "create_history");
      //   //   schedule.scheduleJob(
      //   //     `${min} ${hour} ${date} ${month + 1} *`,
      //   //     async () => {
      //   //       const schema = new interest_logModel();
      //   //       schema.UserId = deposit_log.userId;
      //   //       schema.interest_amount = parseFloat(annual_payout);
      //   //       schema.status = "success";
      //   //       schema.payment_completed = true;
      //   //       schema.intrest_type = "yearly";
      //   //       schema.hours = hour;
      //   //       schema.date = date;
      //   //       schema.month = month + 1;
      //   //       schema.minute = min;
      //   //       const create_interest = await interest_logModel.create(schema);
      //   //       const find_interest_wallet = await stake_interest_walletModel.findOne({
      //   //         UserId: deposit_log.userId,
      //   //       });
      //   //       if (find_interest_wallet) {
      //   //         const update_interest_wallet =
      //   //           await stake_interest_walletModel.findOneAndUpdate(
      //   //             { UserId: deposit_log.userId },
      //   //             {
      //   //               total_amount:
      //   //                 parseFloat(find_interest_wallet.total_amount) +
      //   //                 parseFloat(annual_payout),
      //   //             },
      //   //             { new: true }
      //   //           );
      //   //       } else {
      //   //         const schema1 = new stake_interest_walletModel();
      //   //         schema1.UserId = deposit_log.userId;
      //   //         schema1.total_amount = parseFloat(annual_payout);
      //   //         const create_interest_wallet = await stake_interest_walletModel.create(
      //   //           schema1
      //   //         );
      //   //       }
      //   //     }
      //   //   );
      //   // }
      //   // else {
      //   //   res.status(200).send({
      //   //     data: null,
      //   //     message: "wrong Interest type2",
      //   //     status: 0,
      //   //   });
      //   // }
      //   // ending interest adding

      //   if (find_payment) {
      //     const update_payment = await stake_deposit_walletModel.findOneAndUpdate({ userId: req.body.UserId }, { total_amount: parseFloat(find_payment.total_amount) + parseFloat(final_deposit), crypto: parseFloat(find_payment.crypto) + parseFloat(total_ggo),},{ new: true });
      //     if (find_user.refered_by) {
      //       const find_refuser = await userModel.findOne({ referal_id: find_user.refered_by});
      //       if (find_refuser) {
      //         const one_refer = (parseInt(final_deposit) * 5) / 100;
      //         const four_refer = (parseInt(final_deposit) * 4) / 100;
      //         const three_refer = (parseInt(final_deposit) * 3) / 100;
      //         const last_refer = (parseInt(final_deposit) * 1) / 100;
      //         const two_refer = (parseInt(final_deposit) * 2) / 100;
      //         console.log(one_refer, "5%ref");
      //         console.log(two_refer, "2%ref");
      //         const find_refpayment = await referral_walletModel.findOne({userId: find_refuser._id,});
      //         if (find_refpayment) {
      //           const update_refpayment = await referral_walletModel.findOneAndUpdate({ userId: find_refuser._id },
      //           {total_amount:
      //             parseFloat(find_refpayment.total_amount) +
      //             parseFloat(one_refer),
      //           },{ new: true });
      //           const schema1 = new referrals_logModel()
      //           schema1.amount = parseFloat(one_refer)
      //           schema1.userId = find_refuser._id
      //           schema1.level = "l1"
      //           schema1.addedBy = find_user._id
      //           schema1.save()
      //           if (find_refuser.refered_by) {
      //             const find_ref2 = await userModel.findOne({referal_id: find_refuser.refered_by,});
      //             if (find_ref2) {
      //               const find_paymentref2 = await referral_walletModel.findOne({ userId: find_ref2._id,});
      //               if (find_paymentref2) {
      //                 const update_ref2payment =await referral_walletModel.findOneAndUpdate({ userId: find_ref2._id },
      //                 { total_amount:
      //                   parseFloat(find_paymentref2.total_amount) +
      //                   parseFloat(four_refer),
      //                 },{ new: true });
      //                 const schema2 = new referrals_logModel()
      //                 schema2.amount = parseFloat(four_refer)
      //                 schema2.userId = find_ref2._id
      //                 schema2.level = "l2"
      //                 schema2.addedBy = find_user._id
      //                 schema2.save()
      //                 if (find_ref2.refered_by) {
      //                   const find_ref3 = await userModel.findOne({referal_id: find_ref2.refered_by,});
      //                   if (find_ref3) {
      //                     const find_paymentref3 = await referral_walletModel.findOne({userId: find_ref3._id,});
      //                     if (find_paymentref3) {
      //                       const update_ref3payment = await referral_walletModel.findOneAndUpdate({ userId: find_ref3._id },
      //                       { total_amount:
      //                         parseFloat(find_paymentref3.total_amount) +
      //                         parseFloat(three_refer),
      //                       }, { new: true });
      //                       const schema3 = new referrals_logModel()
      //                       schema3.amount = parseFloat(three_refer)
      //                       schema3.userId = find_ref3._id
      //                       schema3.level = "l3"
      //                       schema3.addedBy = find_user._id
      //                       schema3.save()
      //                       if (find_ref3.refered_by) {
      //                         const find_ref4 = await userModel.findOne({referal_id: find_ref3.refered_by });
      //                         if (find_ref4) {
      //                           const find_paymentref4 = await referral_walletModel.findOne({ userId: find_ref4._id });
      //                           if (find_paymentref4) {
      //                             const update_ref4payment = await referral_walletModel.findOneAndUpdate({ userId: find_ref4._id },
      //                             {
      //                               total_amount:
      //                               parseFloat( find_paymentref4.total_amount) +
      //                               parseFloat(two_refer),
      //                             },{ new: true });
      //                             const schema4 = new referrals_logModel()
      //                             schema4.amount = parseFloat(two_refer)
      //                             schema4.userId = find_ref4._id
      //                             schema4.level = "l4"
      //                             schema4.addedBy = find_user._id
      //                             schema4.save()
      //                             if (find_ref4.refered_by) {
      //                               const find_ref5 = await userModel.findOne({ referal_id: find_ref4.refered_by });
      //                               if (find_ref5) {
      //                                 const find_paymentref5 = await referral_walletModel.findOne({ userId: find_ref5._id,});
      //                                 if (find_paymentref5) {
      //                                   const update_ref5payment = await referral_walletModel.findOneAndUpdate({ userId: find_ref5._id },
      //                                   {
      //                                     total_amount:
      //                                     parseFloat(find_paymentref5.total_amount) + last_refer,
      //                                   },{ new: true });
      //                                   const schema5 = new referrals_logModel()
      //                                   schema5.amount = parseFloat(last_refer)
      //                                   schema5.userId = find_ref5._id
      //                                   schema5.level = "l5"
      //                                   schema5.addedBy = find_user._id
      //                                   schema5.save()
      //                                   if (update_ref5payment) {
      //                                     res.status(200).send({
      //                                       status: 1,
      //                                       message: "reinvest successful",
      //                                     });
      //                                   }
      //                                 } else {
      //                                   res.status(200).send({
      //                                     status: 1,
      //                                     message: "reinvest successful",
      //                                   });
      //                                 }
      //                               } else {
      //                                 res.status(200).send({
      //                                   status: 1,
      //                                   message: "reinvest successful",
      //                                 });
      //                               }
      //                             } else {
      //                               res.status(200).send({
      //                                 status: 1,
      //                                 message: "reinvest successful",
      //                               });
      //                             }
      //                           } else {
      //                             res.status(200).send({
      //                               status: 1,
      //                               message: "reinvest successful",
      //                             });
      //                           }
      //                         } else {
      //                           res.status(200).send({
      //                             status: 1,
      //                             message: "reinvest successful",
      //                           });
      //                         }
      //                       } else {
      //                         res.status(200).send({
      //                           status: 1,
      //                           message: "reinvest successful",
      //                         });
      //                       }
      //                     } else {
      //                       res.status(200).send({
      //                         status: 1,
      //                         message: "reinvest successful",
      //                       });
      //                     }
      //                   } else {
      //                     res.status(200).send({
      //                       status: 1,
      //                       message: "reinvest successful",
      //                     });
      //                   }
      //                 } else {
      //                   res.status(200).send({
      //                     status: 1,
      //                     message: "reinvest successful",
      //                   });
      //                 }
      //               } else {
      //                 const schemaref2 = new referral_walletModel();
      //                 schemaref2.userId = find_ref2._id;
      //                 schemaref2.total_amount = parseFloat(four_refer);
      //                 const add_ref2 = await referral_walletModel.create(schemaref2);
      //                 res.status(200).send({
      //                   status: 1,
      //                   message: "reinvest successful",
      //                 });
      //               }
      //             } else {
      //               res.status(200).send({
      //                 status: 1,
      //                 message: "reinvest successful",
      //               });
      //             }
      //           } else {
      //             res.status(200).send({
      //               status: 1,
      //               message: "reinvest successful",
      //             });
      //           }
      //         } else {
      //           res.status(200).send({
      //             status: 1,
      //             message: "reinvest successful",
      //           });
      //         }
      //       } else {
      //         res.status(200).send({
      //           status: 1,
      //           message: "reinvest successful",
      //         });
      //       }
      //     } else {
      //       res.status(200).send({
      //         status: 1,
      //         message: "reinvest successful",
      //       });
      //     }
      //     // res.status(200).send({
      //     //   status: 1,
      //     //   message: "reinvest successful",
      //     // });
    
      //   } else {
      //     const schema_main = new stake_deposit_walletModel();
      //     schema_main.userId = req.body.UserId;
      //     schema_main.total_amount = final_deposit;
      //     schema_main.crypto = parseFloat(total_ggo);
      //     const create_payment = await stake_deposit_walletModel.create(schema_main);
      //     // res.status(200).send({
      //     //   status: 1,
      //     //   message: "reinvest successful",
      //     // });
      //   }
      // }

    } catch (error) {
      res.status(400).send({
        error: error,
        message: "error in reinvest",
      });
    }
  },

  async get_deposit_log(req, res, next) {
    try {
      const find_user = await userModel.findOne({ _id: req.body.UserId });
      if (find_user) {
        
          
          const find_deposits = await deposit_logModel
            .find({userId: req.body.UserId});
          const payment = await paymentModel.findOne({
            userId: req.body.UserId,
          });
          res.status(200).send({
            data: {
              deposit_log: find_deposits,
              my_investments: payment.total_amount,
              crypto:payment.crypto
            },
            message: "deposit logs",
            status: 1,
            error: null,
          });
        
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
        message: "Error in get deposit log",
        status: 0,
      });
    }
  },

  async get_interest_history(req, res, next) {
    try {
      const get_data = await interest_historyModel.find({
        UserId: req.body.UserId,
      });
      if (get_data.length < 1) {
        res.status(200).send({
          data: null,
          message: "No data found",
          status: 0,
        });
      } else {
        res.status(200).send({
          data: get_data,
          message: "Interest Transaction data",
          status: 1,
          error: null,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "Error in get interest history",
      });
    }
  },

  async get_interest_log(req, res, next) {
    try {
      const find_user = await userModel.findOne({_id:req.body.UserId})
      console.log(find_user,"user_data")
      if(find_user){
      const get_data = await interest_logModel.find({
        UserId: req.body.UserId,
      }).lean();
      console.log(get_data,"interest_log")
      const get_intrest_wallet = await interest_walletModel.findOne({
        UserId: req.body.UserId,
      }).lean();
      const get_latest = await interest_logModel.findOne({
        UserId: req.body.UserId,
      }).sort({_id:-1}).lean();
      var next_credit = 0;
      var latest_credit_data = false
      var next_credit_data = false
      if(get_latest){
       next_credit = new Date(
        get_latest.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        latest_credit_data = true
        next_credit_data = true
      }
      res.status(200).send({
        data: {
          interest_log: get_data,
          stak_intrest: get_intrest_wallet.total_amount,
          latest_credit_data:latest_credit_data,
          latest_credit:get_latest,
          next_credit_data:next_credit_data,
          next_credit:next_credit
        },
        message: "Interest log",
        status: 1,
        error: null,
      });
    }else{
      res.status(200).send({
        data:null,
        message:"User not found",
        status:0
      })
    }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "Error in interest log",
        status: 0,
      });
    }
  },

  async open_pool(req, res, next) {
    try {
      const find_user = await userModel.findOne({ _id: req.body.UserId });
      if (find_user) {
        const schema = new deposit_logModel();
        schema.userId = req.body.UserId;
        schema.amount = req.body.amount;
        schema.paymentCompleted = true;
        schema.currencyType = "INR";
        schema.paymentType = "GGO-Wallet";
        schema.status = "Success";
        const create_deposit_log = await deposit_logModel.create(schema);
        const find_pooling = await poolingModel.findOne({
          UserId: req.body.UserId,
        });
        if (find_pooling) {
          if (find_pooling.round > find_pooling.amount_credited) {
            const find_batch = await pooling_batchModel.findOne({
              batch_no: find_pooling.batch_no,
            });
            if (find_batch) {
              if (find_batch.no_of_users < 7) {
              } else {
              }
            } else {
            }
          } else {
            res.status(200).send("amount deposited");
          }
        } else {
        }
      } else {
        res.status(200).send({
          data: null,
          message: "User Not Found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "error",
        status: 0,
      });
    }
  },

  async add_net_staking(req, res, next) {
    try {
      const find_user = await userModel
        .findOne({ _id: req.body.UserId })
        .lean();
      if (find_user) {
        let stak_reward;
        if (req.body.amount <= 10000) {
          stak_reward = 0.0010;
        } else if (req.body.amount <= 20000) {
          stak_reward = 0.0021;
        } else if (req.body.amount <= 30000) {
          stak_reward = 0.0031;
        } else if (req.body.amount <= 40000) {
          stak_reward = 0.0042;
        } else if (req.body.amount <= 50000) {
          stak_reward = 0.0052;
        } else if (req.body.amount <= 60000) {
          stak_reward = 0.0063;
        } else if (req.body.amount <= 70000) {
          stak_reward = 0.0073;
        } else if (req.body.amount <= 80000) {
          stak_reward = 0.0084;
        } else if (req.body.amount <= 90000) {
          stak_reward = 0.0094;
        } else if (req.body.amount <= 100000) {
          stak_reward = 0.0105;
        } else if (req.body.amount <= 110000) {
          stak_reward = 0.0115;
        } else if (req.body.amount <= 120000) {
          stak_reward = 0.0126;
        } else if (req.body.amount <= 130000) {
          stak_reward = 0.0136;
        } else if (req.body.amount <= 140000) {
          stak_reward = 0.0147;
        } else if (req.body.amount <= 150000) {
          stak_reward = 0.0157;
        } else if (req.body.amount <= 160000) {
          stak_reward = 0.0167;
        } else if (req.body.amount <= 170000) {
          stak_reward = 0.0178;
        } else if (req.body.amount <= 180000) {
          stak_reward = 0.0188;
        } else if (req.body.amount <= 190000) {
          stak_reward = 0.0199;
        } else if (req.body.amount <= 200000) {
          stak_reward = 0.0209;
        } else if (req.body.amount <= 210000) {
          stak_reward = 0.0220;
        } else if (req.body.amount <= 220000) {
          stak_reward = 0.0230;
        } else if (req.body.amount <= 230000) {
          stak_reward = 0.0241;
        } else if (req.body.amount <= 240000) {
          stak_reward = 0.0251;
        } else if (req.body.amount <= 250000) {
          stak_reward = 0.0262;
        } else if (req.body.amount <= 260000) {
          stak_reward = 0.0272;
        } else if (req.body.amount <= 270000) {
          stak_reward = 0.0283;
        } else if (req.body.amount <= 280000) {
          stak_reward = 0.0293;
        } else if (req.body.amount <= 290000) {
          stak_reward = 0.0303;
        } else if (req.body.amount <= 300000) {
          stak_reward = 0.0314;
        } else if (req.body.amount <= 310000) {
          stak_reward = 0.0324;
        } else if (req.body.amount <= 320000) {
          stak_reward = 0.0335;
        } else if (req.body.amount <= 330000) {
          stak_reward = 0.0345;
        } else if (req.body.amount <= 340000) {
          stak_reward = 0.0356;
        } else if (req.body.amount <= 350000) {
          stak_reward = 0.0366;
        } else if (req.body.amount <= 360000) {
          stak_reward = 0.0377;
        } else if (req.body.amount <= 370000) {
          stak_reward = 0.0387;
        } else if (req.body.amount <= 380000) {
          stak_reward = 0.0398;
        } else if (req.body.amount <= 390000) {
          stak_reward = 0.0408;
        } else if (req.body.amount <= 400000) {
          stak_reward = 0.0419;
        } else if (req.body.amount <= 410000) {
          stak_reward = 0.0429;
        } else if (req.body.amount <= 420000) {
          stak_reward = 0.0440;
        } else if (req.body.amount <= 430000) {
          stak_reward = 0.0450;
        } else if (req.body.amount <= 440000) {
          stak_reward = 0.0460;
        } else if (req.body.amount <= 450000) {
         stak_reward = 0.0471;
        } else if (req.body.amount <= 460000) {
          stak_reward = 0.0481;
        } else if (req.body.amount <= 470000) {
          stak_reward = 0.0492;
        } else if (req.body.amount <= 480000) {
          stak_reward = 0.0502;
        } else if (req.body.amount <= 490000) {
         stak_reward = 0.0513;
        } else if (req.body.amount <= 500000) {
          stak_reward = 0.0523;
        }else if(req.body.amount > 500000 ){
          stak_reward = 0.0523;
        }
        console.log(stak_reward,"stak_reward")
        setInterval(() => {
          net_staking_walletModel
            .findOne({ UserId: req.body.UserId })
            .then((result) => {
              console.log(result,"result")
              net_staking_walletModel
                .findOneAndUpdate(
                  { UserId: req.body.UserId },
                  {
                    total_amount:
                      parseFloat(result.total_amount) +
                      parseFloat(stak_reward),
                  },
                  { new: true }
                )
                .then((data1) => {
                  // console.log(data1);
                });
            });
        }, 1000);
        res.status(200).send({
          message:"Net staking rewards adding",
          status:1
        })
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
        message: "Error adding net staking rewards",
        status: 0,
      });
    }
  },

  async deposit_details(req,res,next){
    try{
      const schema = new deposit_detailsModel()
      schema.Upi_id = req.body.Upi_id
      schema.type = req.body.type
      schema.account_number = req.body.account_number
      schema.ifsc_code = req.body.ifsc_code
      schema.account_holder = req.body.account_holder;
      schema.account_type  = req.body.account_type
      schema.bankName = req.body.bankName
      
      const create_deposit_detail = deposit_detailsModel.create(schema);
      const create_deposit =await Promise.all([create_deposit_detail]);
      res.status(200).send({
        data:create_deposit[0],
        message:'deposit data created',
        status:1,
        error:null
      })
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in create deposit details",
        status:0
      })
    }
  },

  async get_deposit_details(req,res,next){
    try{
      const find_upi =  deposit_detailsModel.findOne({type: "UPI"}).lean();
      const find_IMPS = deposit_detailsModel.findOne({type: "IMPS"}).lean();
      const find_Bank_transfer = deposit_detailsModel.findOne({type: "Bank_transfer"}).lean();
      const [upi,imps,bank_transfer] =await Promise.all([find_upi,find_IMPS,find_Bank_transfer])
      res.status(200).send({
        UPI:upi,
        IMPS:imps,
        Bank_transfer:bank_transfer,
        message:"deposit details",
        status:1,
        error:null
      })
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in get deposit details",
        status:0
      })
    }
  },

  async updated_deposit(req,res,next){
    try{
        const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
        if(!find_user){
          res.status(200).send({
            data:null,
            message:"User Not Found",
            status:0
          })
        }else{
          const price = await axios.get(
            "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b"
          );
          console.log(price.data.pairs[0].priceUsd, "prices");
          const GGO_usd = price.data.pairs[0].priceUsd;

          const currency_value = 77.96;
          console.log(currency_value, "data");
          const GGO_inr = parseFloat(currency_value * GGO_usd);
          console.log(GGO_inr, "data1");
          const total_ggo = req.body.amount / GGO_inr;
          console.log(total_ggo, "data");
          const random_number1 = otpGenerator.generate(5, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          const find_wallet = await paymentModel.findOne({userId:req.body.UserId}).lean()
          const schema = new deposit_dataModel()
          schema.userId = req.body.UserId;
          schema.transaction_id = req.body.transaction_id
          schema.deposit_type  = req.body.deposit_type
          schema.interest_type = "monthly"
          schema.transaction_image = req.file.path
          schema.amount = req.body.amount
          schema.crypto = total_ggo
          schema.status = 'pending'
          schema.previous_transaction = find_wallet.total_amount
          schema.wallet_type = req.body.wallet_type
          schema.utr_id = req.body.utr_id
          schema.user_utrId = req.body.user_utrId
          const create_data = await deposit_dataModel.create(schema)

            const schema1 = new deposit_logModel()
            schema1.userId = req.body.UserId;
            schema1.crypto = total_ggo;
            schema1.holding_price = GGO_inr;
            schema1.staking_id = random_number1;
            schema1.orderId = create_data._id;
            schema1.amount = req.body.amount;
            schema1.paymentCompleted = true;
            schema1.currencyType = "INR";
            schema1.paymentType = "GGO-wallet";
            schema1.status = "Pending";
            schema1.previous_transaction = find_wallet.total_amount
            schema1.wallet_type = req.body.wallet_type;
          const create_deposit_log = await deposit_logModel.create(schema1)
          //l1-l5
          let users = await userModel.findOne({ _id:find_user._id }).select({ referal_id: 1, refered_by: 1 ,email : 1 }).lean();
          let L1 = await userModel.find({ refered_by: users.referal_id }).select({ referal_id: 1, refered_by: 1,email : 1 }).lean();
          let total = L1.length;
          let L2 = []
          let L3 = []
          L1.forEach(element => {
            L2.push(userModel.find({ refered_by: element.referal_id }).select({ referal_id: 1, refered_by: 1 ,email : 1 }).lean());
          });
          let l2 = await Promise.all(L2)
          // console.log('l2m',l2)
          var l2_count =[]
          for(let i=0;i<l2.length;i++){
            // console.log(l2[i],"sdfsdf",i)
            for(let j=0;j<l2[i].length;j++){
              l2_count.push(l2[i][j].email)
            }
          }
          console.log(l2_count,"l2_count")
          let L2M = l2.filter(e => e.length);
          L2M.forEach(element => {
      
            element.forEach(data => {
              // console.log('L2M', data)
              total += 1
              L3.push(userModel.find({ refered_by: data.referal_id }).select({ referal_id: 1, refered_by: 1,email : 1  }).lean());
            })
          });
      
          let L4 = []
          let l3 = await Promise.all(L3)
          // console.log('L3M', l3)
          var l3_count =[]
          for(let i=0;i<l3.length;i++){
            // console.log(l3[i],"sdfsdf",i)
            for(let j=0;j<l3[i].length;j++){
              l3_count.push(l3[i][j].email)
            }
          }
          console.log(l3_count,"l3_count")
          let L3M = l3.filter(e => e.length);
      
          L3M.forEach(element => {
            element.forEach(data => {
              total += 1
              L4.push(userModel.find({ refered_by: data.referal_id }).select({ referal_id: 1, refered_by: 1,email : 1  }).lean());
            })
          });
      
          let L5 = []
          let l4 = await Promise.all(L4)
          // console.log('L4M', l4)
          var l4_count =[]
          for(let i=0;i<l4.length;i++){
            // console.log(l4[i],"sdfsdf",i)
            for(let j=0;j<l4[i].length;j++){
              l4_count.push(l4[i][j].email)
            }
          }
          console.log(l4_count,"l4_count")
          let L4M = l4.filter(e => e.length);
          L4M.forEach(element => {
            element.forEach(data => {
              total += 1
              L5.push(userModel.find({ refered_by: data.referal_id }).select({ referal_id: 1, refered_by: 1,email : 1  }).lean());
            })
          });
      
          let L6 = []
          let l5 = await Promise.all(L5)
          // console.log('L5M', l5)
          var l5_count =[]
          for(let i=0;i<l5.length;i++){
            // console.log(l5[i],"sdfsdf",i)
            for(let j=0;j<l5[i].length;j++){
              l5_count.push(l5[i][j].email)
            }
          }
          console.log(l5_count,"l5_count")
          let L5M = l5.filter(e => e.length);
          L5M.forEach(element => {
            element.forEach(data => {
              total += 1
              L6.push(userModel.find({ refered_by: data.referal_id }).select({ referal_id: 1, refered_by: 1 ,email : 1 }).lean());
            })
          });
          //l1-l5
          if(l2_count.length<1){
            l2_count = "no referral found"
          }
          if(l3_count.length<1){
            l3_count = "no referral found"
          }
          if(l4_count.length<1){
            l4_count = "no referral found"
          }
          if(l5_count.length<1){
            l5_count = "no referral found"
          }
          sendEmail({
            subject: `Deposit From GGO of User ${find_user.fullname}`,
            email: "gogametoken@gmail.com",
            // email: "manoj.vinutnaa@gmail.com",
            html: `${find_user.fullname} is deposited the amount Rs.${create_deposit_log.amount}. Please Accept or Reject the Deposit in the Below Link <a href="https://dashboard.ggo.digital/deposits">https://dashboard.ggo.digital/deposits</a>
            l2 : ${l2_count}
            l3 : ${l3_count}
            l4 : ${l4_count}
            l5 : ${l5_count}`, 
          });
          res.status(200).send({
            data:create_data,
            message:"deposit data created",
            status:1,
            error:null
          })
        }
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"error in updated deposit",
      })
    }
  },

  async deposit_rejected(req,res,next){
    try{
      const find_user = await userModel
      .findOne({ _id: req.body.UserId })
      .lean();
    if (find_user) {
      const find_deposit = await deposit_dataModel.findOneAndUpdate(
        { _id: req.body.deposit_id },
        {
          status: "rejected",
        },
        { new: true }
      );

      const update_depositlog = await deposit_logModel.findOneAndUpdate(
        { orderId: find_deposit._id },
        {
          status: "Rejected",
        },
        { new: true }
      );
      res.status(200).send({
        data:find_deposit,
        message:"deposit rejected",
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
        message:"Error in deposit reject",
        status:0
      })
    }
  },

  async deposit_approvel(req, res, next) {
    try {
      const find_user = await userModel.findOne({ _id: req.body.UserId }).lean();
      if (find_user) {
        const find_deposit = await deposit_dataModel.findOneAndUpdate({ _id: req.body.deposit_id },{status: "success" },{ new: true });
        const update_depositlog = await deposit_logModel.findOneAndUpdate({ orderId: find_deposit._id },{status: "Success",},{ new: true });

        if(update_depositlog.wallet_type == "liquidity"){
        const find_payment = await paymentModel.findOne({userId: req.body.UserId});
        if (find_payment) {
          const update_payment = await paymentModel.findOneAndUpdate({ userId: req.body.UserId },
          { total_amount: parseFloat(find_payment.total_amount) +parseFloat(find_deposit.amount),
            crypto: parseFloat(find_payment.crypto) + parseFloat(find_deposit.crypto) 
          },{ new: true });
          console.log(update_payment, "update_payment");
        } else {
          const schema_main = new paymentModel();
          schema_main.userId = req.body.UserId;
          schema_main.total_amount = find_deposit.amount;
          schema_main.crypto = parseFloat(find_deposit.crypto);
          const create_payment = await paymentModel.create(schema_main);
        }

        if (find_user.first_deposit) {
          const find_net_wallet = await net_staking_walletModel.findOne({ UserId: req.body.UserId});
          const update_net_staking = await net_staking_walletModel.findOneAndUpdate({ UserId: req.body.UserId }, {total_amount: parseFloat(find_net_wallet.total_amount) + 500,}, { new: true } );
          const update_user = await userModel.findOneAndUpdate({ _id: req.body.UserId },{ add_bonus: false,first_deposit:false },{ new: true });
        }

        const transaction_id = otpGenerator.generate(6, { upperCaseAlphabets: false,specialChars: false,lowerCaseAlphabets: false, });
        var weekly_pr;
        var annual_pr;
        var monthly_pr;
        var stak_reward;
        if (find_deposit.amount <= 10000) {
          weekly_pr = 0.339;
          annual_pr = 17.65;
          monthly_pr = 1.358;
          stak_reward = 0.0011;
        } else if (find_deposit.amount <= 20000) {
          weekly_pr = 0.341;
          annual_pr = 17.75;
          monthly_pr = 1.365;
          stak_reward = 0.0016;
        } else if (find_deposit.amount <= 30000) {
          weekly_pr = 0.343;
          annual_pr = 17.85;
          monthly_pr = 1.373;
          stak_reward = 0.0025;
        } else if (find_deposit.amount <= 40000) {
          weekly_pr = 0.345;
          annual_pr = 17.95;
          monthly_pr = 1.381;
          stak_reward = 0.0033;
        } else if (find_deposit.amount <= 50000) {
          weekly_pr = 0.347;
          annual_pr = 18.05;
          monthly_pr = 1.388;
          stak_reward = 0.0041 ;
        } else if (find_deposit.amount <= 60000) {
          weekly_pr = 0.349;
          annual_pr = 18.15;
          monthly_pr = 1.396;
          stak_reward = 0.0049;
        } else if (find_deposit.amount <= 70000) {
          weekly_pr = 0.351;
          annual_pr = 18.25;
          monthly_pr = 1.404;
          stak_reward = 0.0057;
        } else if (find_deposit.amount <= 80000) {
          weekly_pr = 0.353;
          annual_pr = 18.35;
          monthly_pr = 1.412;
          stak_reward = 0.0065;
        } else if (find_deposit.amount <= 90000) {
          weekly_pr = 0.355;
          annual_pr = 18.45;
          monthly_pr = 1.419;
          stak_reward = 0.0074;
        } else if (find_deposit.amount <= 100000) {
          weekly_pr = 0.357;
          annual_pr = 18.55;
          monthly_pr = 1.427;
          stak_reward = 0.0082;
        } else if (find_deposit.amount <= 110000) {
          weekly_pr = 0.359;
          annual_pr = 18.65;
          monthly_pr = 1.435;
          stak_reward = 0.0090;
        } else if (find_deposit.amount <= 120000) {
          weekly_pr = 0.361;
          annual_pr = 18.75;
          monthly_pr = 1.442;
          stak_reward = 0.0098;
        } else if (find_deposit.amount <= 130000) {
          weekly_pr = 0.363;
          annual_pr = 18.85;
          monthly_pr = 1.450;
          stak_reward = 0.0106;
        } else if (find_deposit.amount <= 140000) {
          weekly_pr = 0.364;
          annual_pr = 18.95;
          monthly_pr = 1.458;
          stak_reward = 0.0114;
        } else if (find_deposit.amount <= 150000) {
          weekly_pr = 0.366;
          annual_pr = 19.05;
          monthly_pr = 1.465;
          stak_reward = 0.0123;
        } else if (find_deposit.amount <= 160000) {
          weekly_pr = 0.368;
          annual_pr = 19.15;
          monthly_pr = 1.473;
          stak_reward = 0.0131;
        } else if (find_deposit.amount <= 170000) {
          weekly_pr = 0.370;
          annual_pr = 19.25;
          monthly_pr = 1.481;
          stak_reward = 0.0139;
        } else if (find_deposit.amount <= 180000) {
          weekly_pr = 0.372;
          annual_pr = 19.35;
          monthly_pr = 1.488;
          stak_reward = 0.0147;
        } else if (find_deposit.amount <= 190000) {
          weekly_pr = 0.374;
          annual_pr = 19.45;
          monthly_pr = 1.496;
          stak_reward = 0.0155;
        } else if (find_deposit.amount <= 200000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
          stak_reward = 0.0163;
        } else if (find_deposit.amount <= 210000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
          stak_reward = 0.0159;
        } else if (find_deposit.amount <= 220000) {
          weekly_pr = 0.380;
          annual_pr = 19.75;
          monthly_pr = 1.519;
          stak_reward = 0.0167;
        } else if (find_deposit.amount <= 230000) {
          weekly_pr = 0.382;
          annual_pr = 19.85;
          monthly_pr = 1.527;
          stak_reward = 0.0175;
        } else if (find_deposit.amount <= 240000) {
          weekly_pr = 0.384;
          annual_pr = 19.95;
          monthly_pr = 1.535;
          stak_reward = 0.0182;
        } else if (find_deposit.amount <= 250000) {
          weekly_pr = 0.386;
          annual_pr = 20.05;
          monthly_pr = 1.542;
          stak_reward = 0.0190;
        } else if (find_deposit.amount <= 260000) {
          weekly_pr = 0.388;
          annual_pr = 20.15;
          monthly_pr = 1.550;
          stak_reward = 0.0197;
        } else if (find_deposit.amount <= 270000) {
          weekly_pr = 0.389;
          annual_pr = 20.25;
          monthly_pr = 1.558;
          stak_reward = 0.0205;
        } else if (find_deposit.amount <= 280000) {
          weekly_pr = 0.391;
          annual_pr = 20.35;
          monthly_pr = 1.565;
          stak_reward = 0.0213;
        } else if (find_deposit.amount <= 290000) {
          weekly_pr = 0.393;
          annual_pr = 20.45;
          monthly_pr = 1.573;
          stak_reward = 0.0220;
        } else if (find_deposit.amount <= 300000) {
          weekly_pr = 0.395;
          annual_pr = 20.55;
          monthly_pr = 1.581;
          stak_reward = 0.0228;
        } else if (find_deposit.amount <= 310000) {
          weekly_pr = 0.397;
          annual_pr = 20.65;
          monthly_pr = 1.588;
          stak_reward = 0.0235;
        } else if (find_deposit.amount <= 320000) {
          weekly_pr = 0.399;
          annual_pr = 20.75;
          monthly_pr = 1.596;
          stak_reward = 0.0243;
        } else if (find_deposit.amount <= 330000) {
          weekly_pr = 0.401;
          annual_pr = 20.85;
          monthly_pr = 1.604;
          stak_reward = 0.0250;
        } else if (find_deposit.amount <= 340000) {
          weekly_pr = 0.403;
          annual_pr = 20.95;
          monthly_pr = 1.612;
          stak_reward = 0.0258;
        } else if (find_deposit.amount <= 350000) {
          weekly_pr = 0.405;
          annual_pr = 21.05;
          monthly_pr = 1.619;
          stak_reward = 0.0266;
        } else if (find_deposit.amount <= 360000) {
          weekly_pr = 0.407;
          annual_pr = 21.15;
          monthly_pr = 1.627;
          stak_reward = 0.0273;
        } else if (find_deposit.amount <= 370000) {
          weekly_pr =0.409;
          annual_pr = 21.25;
          monthly_pr = 1.635;
          stak_reward = 0.0281;
        } else if (find_deposit.amount <= 380000) {
          weekly_pr = 0.411;
          annual_pr = 21.35;
          monthly_pr = 1.642;
          stak_reward = 0.0288;
        } else if (find_deposit.amount <= 390000) {
          weekly_pr = 0.413;
          annual_pr = 21.45;
          monthly_pr = 1.650;
          stak_reward = 0.0273;
        } else if (find_deposit.amount <= 400000) {
          weekly_pr = 0.414;
          annual_pr = 21.55;
          monthly_pr = 1.658;
          stak_reward = 0.0280;
        } else if (find_deposit.amount <= 410000) {
          weekly_pr = 0.416;
          annual_pr = 21.65;
          monthly_pr = 1.665;
          stak_reward = 0.0287;
        } else if (find_deposit.amount <= 420000) {
          weekly_pr = 0.418;
          annual_pr = 21.75;
          monthly_pr = 1.673;
          stak_reward = 0.0294;
        } else if (find_deposit.amount <= 430000) {
          weekly_pr = 0.420;
          annual_pr = 21.85;
          monthly_pr = 1.681;
          stak_reward = 0.0301;
        } else if (find_deposit.amount <= 440000) {
          weekly_pr = 0.422;
          annual_pr = 21.95;
          monthly_pr = 1.688;
          stak_reward = 0.0308;
        } else if (find_deposit.amount <= 450000) {
          weekly_pr = 0.424;
          annual_pr = 22.05;
          monthly_pr = 1.696;
          stak_reward = 0.0315;
        } else if (find_deposit.amount <= 460000) {
          weekly_pr = 0.426;
          annual_pr = 22.15;
          monthly_pr = 1.704;
          stak_reward = 0.0309;
        } else if (find_deposit.amount <= 470000) {
          weekly_pr = 0.428;
          annual_pr = 22.25;
          monthly_pr = 1.712;
          stak_reward = 0.0316;
        } else if (find_deposit.amount <= 480000) {
          weekly_pr = 0.430;
          annual_pr = 22.35;
          monthly_pr = 1.719;
          stak_reward = 0.0322;
        } else if (find_deposit.amount <= 490000) {
          weekly_pr = 0.432;
          annual_pr = 22.45;
          monthly_pr = 1.727;
          stak_reward = 0.0329;
        } else if (find_deposit.amount <= 500000) {
          weekly_pr = 0.434;
          annual_pr = 22.55;
          monthly_pr = 1.735;
          stak_reward = 0.0336;
        } else if (find_deposit.amount <= 600000) {
          weekly_pr = 0.436;
          annual_pr = 22.65;
          monthly_pr = 1.742;
          stak_reward = 0.0350;
        } else if (find_deposit.amount <= 700000) {
          weekly_pr = 0.438;
          annual_pr = 22.75;
          monthly_pr = 1.750;
          stak_reward = 0.0396;
        } else if (find_deposit.amount <= 800000) {
          weekly_pr = 0.439;
          annual_pr = 22.85;
          monthly_pr = 1.758;
          stak_reward = 0.0444;
        } else if (find_deposit.amount <= 900000) {
          weekly_pr = 0.441;
          annual_pr = 22.95;
          monthly_pr = 1.765;
          stak_reward = 0.0499;
        } else if (find_deposit.amount <= 1000000) {
          weekly_pr = 0.445;
          annual_pr = 23.15;
          monthly_pr = 1.781;
          stak_reward = 0.0525;
        } else if (find_deposit.amount <= 1500000) {
          weekly_pr = 0.447;
          annual_pr = 23.25;
          monthly_pr = 1.788;
          stak_reward = 0.0779;
        } else if (find_deposit.amount <= 2000000) {
          weekly_pr = 0.449;
          annual_pr = 23.35;
          monthly_pr = 1.796;
          stak_reward = 0.1028;
        } else if (find_deposit.amount <= 2500000) {
          weekly_pr = 0.451;
          annual_pr = 23.45;
          monthly_pr = 1.804;
          stak_reward = 0.1241;
        } else if (find_deposit.amount <= 3000000) {
          weekly_pr = 0.453;
          annual_pr = 23.55;
          monthly_pr = 1.812;
          stak_reward = 0.1454;
        } else if (find_deposit.amount <= 3500000) {
          weekly_pr = 0.455;
          annual_pr = 23.65;
          monthly_pr = 1.819;
          stak_reward = 0.1655;
        } else if (find_deposit.amount <= 4000000) {
          weekly_pr = 0.457;
          annual_pr = 23.75;
          monthly_pr = 1.827;
          stak_reward = 0.1845;
        } else if (find_deposit.amount <= 4500000) {
          weekly_pr = 0.459;
          annual_pr = 23.65;
          monthly_pr = 1.835;
          stak_reward = 0.2023;
        }else if (find_deposit.amount <= 5100000) {
          weekly_pr = 0.462;
          annual_pr = 23.55;
          monthly_pr = 1.846;
          stak_reward = 0.2233;
        }

        const weekly_payout = (weekly_pr * find_deposit.amount) / 100;
        const monthly_payout = (monthly_pr * find_deposit.amount) / 100;
        const annual_payout = (annual_pr * find_deposit.amount) / 100;
        // end checking interest
        // staking rewards

        setInterval(() => {
          net_staking_walletModel.findOne({ UserId: req.body.UserId })
          .then((result) => {
            net_staking_walletModel.findOneAndUpdate({ UserId: req.body.UserId },{total_amount:parseFloat(result.total_amount) + parseFloat(stak_reward)}, { new: true })
            .then((data1) => {
              // console.log(data1);
            });
          });
        }, 1000);

        // staking rewards
        // interest adding
        const d = new Date();
        let day = d.getDay();
        let month = d.getMonth();
        let date = d.getDate();
        let hour = d.getHours();
        let min = d.getMinutes();
        // if (find_deposit.interest_type == "weekly") {
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = update_depositlog.userId;
        //   schema1.deposit_id = update_depositlog._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = update_depositlog.staking_id;
        //   schema1.intrest_amount = parseFloat(weekly_payout);
        //   schema1.amount = find_deposit.amount;
        //   schema1.status = true;
        //   schema1.interest_percentage = weekly_pr;
        //   schema1.day = day;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "weekly";
        //   schema1.deposit_type = update_depositlog.wallet_type;
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "data");
        //   schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
        //     console.log(req.body, "data");
        //     const schema = new interest_logModel();
        //     schema.UserId = update_depositlog.userId;
        //     schema.intrest_amount = parseFloat(weekly_payout);
        //     schema.status = "success";
        //     schema.payment_completed = true;
        //     schema.intrest_type = "weekly";
        //     schema.hours = hour;
        //     schema.day = day;
        //     schema.minute = min;
        //     schema.deposit_type = update_depositlog.wallet_type;
        //     const create_interest = await interest_logModel.create(schema);
        //     const find_interest_wallet = await interest_walletModel.findOne({UserId: update_depositlog.userId});
        //     if (find_interest_wallet) {
        //       const update_interest_wallet = await interest_walletModel.findOneAndUpdate({ UserId: update_depositlog.userId },{total_amount: parseFloat(find_interest_wallet.total_amount) + parseFloat(weekly_payout) },{ new: true });
        //     } else {
        //       const schema1 = new interest_walletModel();
        //       schema1.UserId = update_depositlog.userId;
        //       schema1.total_amount = parseFloat(weekly_payout);
        //       const create_interest_wallet = await interest_walletModel.create(schema1);
        //     }
        //   });
        // } 
        //  if (find_deposit.interest_type == "monthly") {
          const schema1 = new intrest_historyModel();
          schema1.UserId = update_depositlog.userId;
          schema1.deposit_id = update_depositlog._id;
          schema1.transaction_id = transaction_id;
          schema1.staking_id = update_depositlog.staking_id;
          schema1.intrest_amount = parseFloat(monthly_payout);
          schema1.amount = find_deposit.amount;
          schema1.status = true;
          schema1.interest_percentage = monthly_pr;
          schema1.date = date;
          schema1.hours = hour;
          schema1.minute = min;
          schema1.interest_type = "monthly";
          schema1.wallet_type = update_depositlog.wallet_type;
          const create_history = await intrest_historyModel.create(schema1);
          console.log(create_history, "data");
          schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
            console.log(req.body, "data");
            const schema = new interest_logModel();
            schema.UserId = update_depositlog.userId;
            schema.intrest_amount = parseFloat(monthly_payout);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "monthly";
            schema.hours = hour;
            schema.date = date;
            schema.minute = min;
            schema.wallet_type = update_depositlog.wallet_type;
            const create_interest = await interest_logModel.create(schema);
            const find_interest_wallet = await interest_walletModel.findOne({UserId: update_depositlog.userId });
            if (find_interest_wallet) {
              const update_interest_wallet = await interest_walletModel.findOneAndUpdate({ UserId: update_depositlog.userId }, {total_amount: parseFloat(find_interest_wallet.total_amount) + parseFloat(monthly_payout) }, { new: true });
            } else {
              const schema1 = new interest_walletModel();
              schema1.UserId = update_depositlog.userId;
              schema1.total_amount = parseFloat(monthly_payout);
              const create_interest_wallet = await interest_walletModel.create(schema1);
            }
          });
        // } 
        // else if (find_deposit.interest_type == "yearly") {
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = update_depositlog.userId;
        //   schema1.deposit_id = update_depositlog._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = update_depositlog.staking_id;
        //   schema1.intrest_amount = parseFloat(annual_payout);
        //   schema1.amount = find_deposit.amount;
        //   schema1.status = true;
        //   schema1.interest_percentage = annual_pr;
        //   schema1.month = month;
        //   schema1.date = date;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "yearly";
        //   schema1.deposit_type = update_depositlog.wallet_type;
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "data");
        //   schedule.scheduleJob(
        //     `${min} ${hour} ${date} ${month + 1} *`,
        //     async () => {
        //       console.log(req.body, "data");
        //       const schema = new interest_logModel();
        //       schema.UserId = update_depositlog.userId;
        //       schema.intrest_amount = parseFloat(annual_payout);
        //       schema.status = "success";
        //       schema.payment_completed = true;
        //       schema.intrest_type = "yearly";
        //       schema.hours = hour;
        //       schema.date = date;
        //       schema.month = month + 1;
        //       schema.minute = min;
        //       schema.deposit_type = update_depositlog.wallet_type;
        //       const create_interest = await interest_logModel.create(schema);
        //       const find_interest_wallet = await interest_walletModel.findOne({ UserId: update_depositlog.userId });
        //       if (find_interest_wallet) {
        //         const update_interest_wallet = await interest_walletModel.findOneAndUpdate({ UserId: update_depositlog.userId }, { total_amount: find_interest_wallet.total_amount + parseFloat(annual_payout)}, { new: true });
        //       } else {
        //         const schema1 = new interest_walletModel();
        //         schema1.UserId = update_depositlog.userId;
        //         schema1.total_amount = parseFloat(annual_payout);
        //         const create_interest_wallet = await interest_walletModel.create(schema1);
        //       }
        //     }
        //   );
        // } 
        // else {
        //   res.status(200).send({
        //     data: null,
        //     message: "wrong Interest type1",
        //     status: 0,
        //   });
        // }
        // ending interest adding
        // referral add
        if (find_deposit) {
          if (find_user.refered_by) {
            const find_refuser = await userModel.findOne({ referal_id: find_user.refered_by});
            if (find_refuser) {
              const one_refer = (parseInt(find_deposit.amount) * 5) / 100;
              const four_refer = (parseInt(find_deposit.amount) * 4) / 100;
              const three_refer = (parseInt(find_deposit.amount) * 3) / 100;
              const last_refer = (parseInt(find_deposit.amount) * 1) / 100;
              const two_refer = (parseInt(find_deposit.amount) * 2) / 100;
              console.log(one_refer, "5%ref");
              console.log(two_refer, "2%ref");
              const find_refpayment = await referral_walletModel.findOne({userId: find_refuser._id});
              if (find_refpayment) {
                const update_refpayment = await referral_walletModel.findOneAndUpdate(
                  { userId: find_refuser._id },
                  { total_amount: parseFloat(find_refpayment.total_amount) + parseFloat(one_refer)},{ new: true });
                  const schema1 = new referrals_logModel()
                schema1.amount = parseFloat(one_refer)
                schema1.userId = find_refuser._id
                schema1.level = "l1"
                schema1.addedBy = find_user._id
                schema1.save()
                if (find_refuser.refered_by) {
                  const find_ref2 = await userModel.findOne({referal_id: find_refuser.refered_by });
                  if (find_ref2) {
                    const find_paymentref2 = await referral_walletModel.findOne({userId: find_ref2._id});
                    if (find_paymentref2) {
                      const update_ref2payment = await referral_walletModel.findOneAndUpdate(
                        { userId: find_ref2._id },
                        { total_amount: parseFloat(find_paymentref2.total_amount) + parseFloat(four_refer),}, 
                        { new: true });
                        const schema2 = new referrals_logModel()
                      schema2.amount = parseFloat(four_refer)
                      schema2.userId = find_ref2._id
                      schema2.level = "l2"
                      schema2.addedBy = find_user._id
                      schema2.save()
                      if (find_ref2.refered_by) {
                        const find_ref3 = await userModel.findOne({ referal_id: find_ref2.refered_by });
                        if (find_ref3) {
                          const find_paymentref3 = await referral_walletModel.findOne({userId: find_ref3._id});
                          if (find_paymentref3) {
                            const update_ref3payment = await referral_walletModel.findOneAndUpdate(
                              { userId: find_ref3._id },
                              { total_amount: parseFloat(find_paymentref3.total_amount) + parseFloat(three_refer), },{ new: true });
                              const schema3 = new referrals_logModel()
                            schema3.amount = parseFloat(three_refer)
                            schema3.userId = find_ref3._id
                            schema3.level = "l3"
                            schema3.addedBy = find_user._id
                            schema3.save()
                            if (find_ref3.refered_by) {
                              const find_ref4 = await userModel.findOne({ referal_id: find_ref3.refered_by });
                              if (find_ref4) {
                                const find_paymentref4 = await referral_walletModel.findOne({ userId: find_ref4._id});
                                if (find_paymentref4) {
                                  const update_ref4payment = await referral_walletModel.findOneAndUpdate(
                                    { userId: find_ref4._id },
                                     { total_amount: parseFloat(find_paymentref4.total_amount) + parseFloat(two_refer), },{ new: true });const schema4 = new referrals_logModel()
                                     schema4.amount = parseFloat(two_refer)
                                     schema4.userId = find_ref4._id
                                     schema4.level = "l4"
                                     schema4.addedBy = find_user._id
                                     schema4.save()
                                  if (find_ref4.refered_by) {
                                    const find_ref5 = await userModel.findOne({referal_id: find_ref4.refered_by});
                                    if (find_ref5) {
                                      const find_paymentref5 = await referral_walletModel.findOne({userId: find_ref5._id});
                                      if (find_paymentref5) {
                                        const update_ref5payment = await referral_walletModel.findOneAndUpdate(
                                          { userId: find_ref5._id },
                                           {total_amount: parseFloat( find_paymentref5.total_amount) + last_refer},{ new: true } );
                                           const schema5 = new referrals_logModel()
                                        schema5.amount = parseFloat(last_refer)
                                        schema5.userId = find_ref5._id
                                        schema5.level = "l5"
                                        schema5.addedBy = find_user._id
                                        schema5.save()
                                        if (update_ref5payment) {
                                          res.status(200).send({
                                            data: find_deposit,
                                            message: "deposit successful",
                                            status: 1,
                                            error: null,
                                          });
                                        }
                                      } else {
                                        res.status(200).send({
                                          data: find_deposit,
                                          message: "payment log created",
                                          status: 1,
                                          error: null,
                                        });
                                      }
                                    } else {
                                      res.status(200).send({
                                        data: find_deposit,
                                        message: "payment log created",
                                        status: 1,
                                        error: null,
                                      });
                                    }
                                  } else {
                                    res.status(200).send({
                                      data: find_deposit,
                                      message: "payment log created",
                                      status: 1,
                                      error: null,
                                    });
                                  }
                                } else {
                                  res.status(200).send({
                                    data: find_deposit,
                                    message: "payment log created",
                                    status: 1,
                                    error: null,
                                  });
                                }
                              } else {
                                res.status(200).send({
                                  data: find_deposit,
                                  message: "payment log created",
                                  status: 1,
                                  error: null,
                                });
                              }
                            } else {
                              res.status(200).send({
                                data: find_deposit,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            res.status(200).send({
                              data: find_deposit,
                              message: "payment log created",
                              status: 1,
                              error: null,
                            });
                          }
                        } else {
                          res.status(200).send({
                            data: find_deposit,
                            message: "payment log created",
                            status: 1,
                            error: null,
                          });
                        }
                      } else {
                        res.status(200).send({
                          data: find_deposit,
                          message: "payment log created",
                          status: 1,
                          error: null,
                        });
                      }
                    } else {
                      res.status(200).send({
                        data: find_deposit,
                        message: "payment log created",
                        status: 1,
                        error: null,
                      });
                    }
                  } else {
                    res.status(200).send({
                      data: find_deposit,
                      message: "payment log created",
                      status: 1,
                      error: null,
                    });
                  }
                } else {
                  res.status(200).send({
                    data: find_deposit,
                    message: "payment log created",
                    status: 1,
                    error: null,
                  });
                }
              } else {
                res.status(200).send({
                  data: find_deposit,
                  message: "payment log created",
                  status: 1,
                  error: null,
                });
              }
            } else {
              res.status(200).send({
                data: find_deposit,
                message: "payment log created",
                status: 1,
                error: null,
              });
            }
          } else {
            res.status(200).send({
              data: find_deposit,
              message: "payment log created",
              status: 1,
              error: null,
            });
          }
        } else {
          res.status(200).send({
            data: find_deposit,
            message: "error in deposit",
            status: 0,
          });
        }
      }


      else if(update_depositlog.wallet_type == "stake"){
        const find_payment = await stake_deposit_walletModel.findOne({userId: req.body.UserId });
        if (find_payment) {
          const update_payment = await stake_deposit_walletModel.findOneAndUpdate({ userId: req.body.UserId },
          {
            total_amount: parseFloat(find_payment.total_amount) + parseFloat(find_deposit.amount),
            crypto: parseFloat(find_payment.crypto) + parseFloat(find_deposit.crypto)
          }, { new: true });

          console.log(update_payment, "update_payment");
        } else {
          const schema_main = new stake_deposit_walletModel();
          schema_main.userId = req.body.UserId;
          schema_main.total_amount = find_deposit.amount;
          schema_main.crypto = parseFloat(find_deposit.crypto);
          const create_payment = await stake_deposit_walletModel.create(schema_main);
        }

        if (find_user.first_deposit) {
          const find_net_wallet = await stake_nsr_walletModel.findOne({ UserId: req.body.UserId});
          const update_net_staking = await stake_nsr_walletModel.findOneAndUpdate({ UserId: req.body.UserId }, {total_amount: parseFloat(find_net_wallet.total_amount) + 500}, { new: true });
          const update_user = await userModel.findOneAndUpdate({ _id: req.body.UserId },{ add_bonus: false,first_deposit:false }, { new: true });
        }
        const transaction_id = otpGenerator.generate(6, {upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false,});
        var weekly_pr;
        var annual_pr;
        var monthly_pr;
        var stak_reward;
        if (find_deposit.amount <= 10000) {
          weekly_pr = 0.339;
          annual_pr = 17.65;
          monthly_pr = 1.358;
          stak_reward = 0.0011;
        } else if (find_deposit.amount <= 20000) {
          weekly_pr = 0.341;
          annual_pr = 17.75;
          monthly_pr = 1.365;
          stak_reward = 0.0016;
        } else if (find_deposit.amount <= 30000) {
          weekly_pr = 0.343;
          annual_pr = 17.85;
          monthly_pr = 1.373;
          stak_reward = 0.0025;
        } else if (find_deposit.amount <= 40000) {
          weekly_pr = 0.345;
          annual_pr = 17.95;
          monthly_pr = 1.381;
          stak_reward = 0.0033;
        } else if (find_deposit.amount <= 50000) {
          weekly_pr = 0.347;
          annual_pr = 18.05;
          monthly_pr = 1.388;
          stak_reward = 0.0041 ;
        } else if (find_deposit.amount <= 60000) {
          weekly_pr = 0.349;
          annual_pr = 18.15;
          monthly_pr = 1.396;
          stak_reward = 0.0049;
        } else if (find_deposit.amount <= 70000) {
          weekly_pr = 0.351;
          annual_pr = 18.25;
          monthly_pr = 1.404;
          stak_reward = 0.0057;
        } else if (find_deposit.amount <= 80000) {
          weekly_pr = 0.353;
          annual_pr = 18.35;
          monthly_pr = 1.412;
          stak_reward = 0.0065;
        } else if (find_deposit.amount <= 90000) {
          weekly_pr = 0.355;
          annual_pr = 18.45;
          monthly_pr = 1.419;
          stak_reward = 0.0074;
        } else if (find_deposit.amount <= 100000) {
          weekly_pr = 0.357;
          annual_pr = 18.55;
          monthly_pr = 1.427;
          stak_reward = 0.0082;
        } else if (find_deposit.amount <= 110000) {
          weekly_pr = 0.359;
          annual_pr = 18.65;
          monthly_pr = 1.435;
          stak_reward = 0.0090;
        } else if (find_deposit.amount <= 120000) {
          weekly_pr = 0.361;
          annual_pr = 18.75;
          monthly_pr = 1.442;
          stak_reward = 0.0098;
        } else if (find_deposit.amount <= 130000) {
          weekly_pr = 0.363;
          annual_pr = 18.85;
          monthly_pr = 1.450;
          stak_reward = 0.0106;
        } else if (find_deposit.amount <= 140000) {
          weekly_pr = 0.364;
          annual_pr = 18.95;
          monthly_pr = 1.458;
          stak_reward = 0.0114;
        } else if (find_deposit.amount <= 150000) {
          weekly_pr = 0.366;
          annual_pr = 19.05;
          monthly_pr = 1.465;
          stak_reward = 0.0123;
        } else if (find_deposit.amount <= 160000) {
          weekly_pr = 0.368;
          annual_pr = 19.15;
          monthly_pr = 1.473;
          stak_reward = 0.0131;
        } else if (find_deposit.amount <= 170000) {
          weekly_pr = 0.370;
          annual_pr = 19.25;
          monthly_pr = 1.481;
          stak_reward = 0.0139;
        } else if (find_deposit.amount <= 180000) {
          weekly_pr = 0.372;
          annual_pr = 19.35;
          monthly_pr = 1.488;
          stak_reward = 0.0147;
        } else if (find_deposit.amount <= 190000) {
          weekly_pr = 0.374;
          annual_pr = 19.45;
          monthly_pr = 1.496;
          stak_reward = 0.0155;
        } else if (find_deposit.amount <= 200000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
          stak_reward = 0.0163;
        } else if (find_deposit.amount <= 210000) {
          weekly_pr = 0.376;
          annual_pr = 19.55;
          monthly_pr = 1.504;
          stak_reward = 0.0159;
        } else if (find_deposit.amount <= 220000) {
          weekly_pr = 0.380;
          annual_pr = 19.75;
          monthly_pr = 1.519;
          stak_reward = 0.0167;
        } else if (find_deposit.amount <= 230000) {
          weekly_pr = 0.382;
          annual_pr = 19.85;
          monthly_pr = 1.527;
          stak_reward = 0.0175;
        } else if (find_deposit.amount <= 240000) {
          weekly_pr = 0.384;
          annual_pr = 19.95;
          monthly_pr = 1.535;
          stak_reward = 0.0182;
        } else if (find_deposit.amount <= 250000) {
          weekly_pr = 0.386;
          annual_pr = 20.05;
          monthly_pr = 1.542;
          stak_reward = 0.0190;
        } else if (find_deposit.amount <= 260000) {
          weekly_pr = 0.388;
          annual_pr = 20.15;
          monthly_pr = 1.550;
          stak_reward = 0.0197;
        } else if (find_deposit.amount <= 270000) {
          weekly_pr = 0.389;
          annual_pr = 20.25;
          monthly_pr = 1.558;
          stak_reward = 0.0205;
        } else if (find_deposit.amount <= 280000) {
          weekly_pr = 0.391;
          annual_pr = 20.35;
          monthly_pr = 1.565;
          stak_reward = 0.0213;
        } else if (find_deposit.amount <= 290000) {
          weekly_pr = 0.393;
          annual_pr = 20.45;
          monthly_pr = 1.573;
          stak_reward = 0.0220;
        } else if (find_deposit.amount <= 300000) {
          weekly_pr = 0.395;
          annual_pr = 20.55;
          monthly_pr = 1.581;
          stak_reward = 0.0228;
        } else if (find_deposit.amount <= 310000) {
          weekly_pr = 0.397;
          annual_pr = 20.65;
          monthly_pr = 1.588;
          stak_reward = 0.0235;
        } else if (find_deposit.amount <= 320000) {
          weekly_pr = 0.399;
          annual_pr = 20.75;
          monthly_pr = 1.596;
          stak_reward = 0.0243;
        } else if (find_deposit.amount <= 330000) {
          weekly_pr = 0.401;
          annual_pr = 20.85;
          monthly_pr = 1.604;
          stak_reward = 0.0250;
        } else if (find_deposit.amount <= 340000) {
          weekly_pr = 0.403;
          annual_pr = 20.95;
          monthly_pr = 1.612;
          stak_reward = 0.0258;
        } else if (find_deposit.amount <= 350000) {
          weekly_pr = 0.405;
          annual_pr = 21.05;
          monthly_pr = 1.619;
          stak_reward = 0.0266;
        } else if (find_deposit.amount <= 360000) {
          weekly_pr = 0.407;
          annual_pr = 21.15;
          monthly_pr = 1.627;
          stak_reward = 0.0273;
        } else if (find_deposit.amount <= 370000) {
          weekly_pr =0.409;
          annual_pr = 21.25;
          monthly_pr = 1.635;
          stak_reward = 0.0281;
        } else if (find_deposit.amount <= 380000) {
          weekly_pr = 0.411;
          annual_pr = 21.35;
          monthly_pr = 1.642;
          stak_reward = 0.0288;
        } else if (find_deposit.amount <= 390000) {
          weekly_pr = 0.413;
          annual_pr = 21.45;
          monthly_pr = 1.650;
          stak_reward = 0.0273;
        } else if (find_deposit.amount <= 400000) {
          weekly_pr = 0.414;
          annual_pr = 21.55;
          monthly_pr = 1.658;
          stak_reward = 0.0280;
        } else if (find_deposit.amount <= 410000) {
          weekly_pr = 0.416;
          annual_pr = 21.65;
          monthly_pr = 1.665;
          stak_reward = 0.0287;
        } else if (find_deposit.amount <= 420000) {
          weekly_pr = 0.418;
          annual_pr = 21.75;
          monthly_pr = 1.673;
          stak_reward = 0.0294;
        } else if (find_deposit.amount <= 430000) {
          weekly_pr = 0.420;
          annual_pr = 21.85;
          monthly_pr = 1.681;
          stak_reward = 0.0301;
        } else if (find_deposit.amount <= 440000) {
          weekly_pr = 0.422;
          annual_pr = 21.95;
          monthly_pr = 1.688;
          stak_reward = 0.0308;
        } else if (find_deposit.amount <= 450000) {
          weekly_pr = 0.424;
          annual_pr = 22.05;
          monthly_pr = 1.696;
          stak_reward = 0.0315;
        } else if (find_deposit.amount <= 460000) {
          weekly_pr = 0.426;
          annual_pr = 22.15;
          monthly_pr = 1.704;
          stak_reward = 0.0309;
        } else if (find_deposit.amount <= 470000) {
          weekly_pr = 0.428;
          annual_pr = 22.25;
          monthly_pr = 1.712;
          stak_reward = 0.0316;
        } else if (find_deposit.amount <= 480000) {
          weekly_pr = 0.430;
          annual_pr = 22.35;
          monthly_pr = 1.719;
          stak_reward = 0.0322;
        } else if (find_deposit.amount <= 490000) {
          weekly_pr = 0.432;
          annual_pr = 22.45;
          monthly_pr = 1.727;
          stak_reward = 0.0329;
        } else if (find_deposit.amount <= 500000) {
          weekly_pr = 0.434;
          annual_pr = 22.55;
          monthly_pr = 1.735;
          stak_reward = 0.0336;
        } else if (find_deposit.amount <= 600000) {
          weekly_pr = 0.436;
          annual_pr = 22.65;
          monthly_pr = 1.742;
          stak_reward = 0.0350;
        } else if (find_deposit.amount <= 700000) {
          weekly_pr = 0.438;
          annual_pr = 22.75;
          monthly_pr = 1.750;
          stak_reward = 0.0396;
        } else if (find_deposit.amount <= 800000) {
          weekly_pr = 0.439;
          annual_pr = 22.85;
          monthly_pr = 1.758;
          stak_reward = 0.0444;
        } else if (find_deposit.amount <= 900000) {
          weekly_pr = 0.441;
          annual_pr = 22.95;
          monthly_pr = 1.765;
          stak_reward = 0.0499;
        } else if (find_deposit.amount <= 1000000) {
          weekly_pr = 0.445;
          annual_pr = 23.15;
          monthly_pr = 1.781;
          stak_reward = 0.0525;
        } else if (find_deposit.amount <= 1500000) {
          weekly_pr = 0.447;
          annual_pr = 23.25;
          monthly_pr = 1.788;
          stak_reward = 0.0779;
        } else if (find_deposit.amount <= 2000000) {
          weekly_pr = 0.449;
          annual_pr = 23.35;
          monthly_pr = 1.796;
          stak_reward = 0.1028;
        } else if (find_deposit.amount <= 2500000) {
          weekly_pr = 0.451;
          annual_pr = 23.45;
          monthly_pr = 1.804;
          stak_reward = 0.1241;
        } else if (find_deposit.amount <= 3000000) {
          weekly_pr = 0.453;
          annual_pr = 23.55;
          monthly_pr = 1.812;
          stak_reward = 0.1454;
        } else if (find_deposit.amount <= 3500000) {
          weekly_pr = 0.455;
          annual_pr = 23.65;
          monthly_pr = 1.819;
          stak_reward = 0.1655;
        } else if (find_deposit.amount <= 4000000) {
          weekly_pr = 0.457;
          annual_pr = 23.75;
          monthly_pr = 1.827;
          stak_reward = 0.1845;
        } else if (find_deposit.amount <= 4500000) {
          weekly_pr = 0.459;
          annual_pr = 23.65;
          monthly_pr = 1.835;
          stak_reward = 0.2023;
        }else if (find_deposit.amount <= 5100000) {
          weekly_pr = 0.462;
          annual_pr = 23.55;
          monthly_pr = 1.846;
          stak_reward = 0.2233;
        }
        const weekly_payout = (weekly_pr * find_deposit.amount) / 100;
        const monthly_payout = (monthly_pr * find_deposit.amount) / 100;
        const annual_payout = (annual_pr * find_deposit.amount) / 100;
        // end checking interest
        // staking rewards

        setInterval(() => {
          stake_nsr_walletModel.findOne({ UserId: req.body.UserId })
            .then((result) => {
              stake_nsr_walletModel.findOneAndUpdate({ UserId: req.body.UserId },{total_amount: parseFloat(result.total_amount) + parseFloat(stak_reward)},{ new: true })
              .then((data1) => {
                // console.log(data1);
              });
            });
        }, 1000);

        // staking rewards
        // interest adding
        const d = new Date();
        let day = d.getDay();
        let month = d.getMonth();
        let date = d.getDate();
        let hour = d.getHours();
        let min = d.getMinutes();
        // if (find_deposit.interest_type == "weekly") {
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = update_depositlog.userId;
        //   schema1.deposit_id = update_depositlog._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = update_depositlog.staking_id;
        //   schema1.intrest_amount = parseFloat(weekly_payout);
        //   schema1.amount = find_deposit.amount;
        //   schema1.status = true;
        //   schema1.interest_percentage = weekly_pr;
        //   schema1.day = day;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "weekly";
        //   schema1.deposit_type = update_depositlog.wallet_type;
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "data");
        //   schedule.scheduleJob(`${min} ${hour} * * ${day}`, async () => {
        //     console.log(req.body, "data");
        //     const schema = new interest_logModel();
        //     schema.UserId = update_depositlog.userId;
        //     schema.intrest_amount = parseFloat(weekly_payout);
        //     schema.status = "success";
        //     schema.payment_completed = true;
        //     schema.intrest_type = "weekly";
        //     schema.hours = hour;
        //     schema.day = day;
        //     schema.minute = min;
        //     schema.deposit_type = update_depositlog.wallet_type;
        //     const create_interest = await interest_logModel.create(schema);
        //     const find_interest_wallet = await stake_interest_walletModel.findOne({UserId: update_depositlog.userId});
        //     if (find_interest_wallet) {
        //       const update_interest_wallet = await stake_interest_walletModel.findOneAndUpdate({ UserId: update_depositlog.userId }, {total_amount: parseFloat(find_interest_wallet.total_amount) + parseFloat(weekly_payout) },{ new: true });
        //     } else {
        //       const schema1 = new stake_interest_walletModel();
        //       schema1.UserId = update_depositlog.userId;
        //       schema1.total_amount = parseFloat(weekly_payout);
        //       const create_interest_wallet = await stake_interest_walletModel.create(schema1);
        //     }
        //   });
        // } 
        // if (find_deposit.interest_type == "monthly") {
          const schema1 = new intrest_historyModel();
          schema1.UserId = update_depositlog.userId;
          schema1.deposit_id = update_depositlog._id;
          schema1.transaction_id = transaction_id;
          schema1.staking_id = update_depositlog.staking_id;
          schema1.intrest_amount = parseFloat(monthly_payout);
          schema1.amount = find_deposit.amount;
          schema1.status = true;
          schema1.interest_percentage = monthly_pr;
          schema1.date = date;
          schema1.hours = hour;
          schema1.minute = min;
          schema1.interest_type = "monthly";
          schema1.wallet_type = update_depositlog.wallet_type;
          const create_history = await intrest_historyModel.create(schema1);
          console.log(create_history, "data");
          schedule.scheduleJob(`${min} ${hour} ${date} * *`, async () => {
            console.log(req.body, "data");
            const schema = new interest_logModel();
            schema.UserId = update_depositlog.userId;
            schema.intrest_amount = parseFloat(monthly_payout);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "monthly";
            schema.hours = hour;
            schema.date = date;
            schema.minute = min;
            schema.wallet_type = update_depositlog.wallet_type;
            const create_interest = await interest_logModel.create(schema);
            const find_interest_wallet = await stake_interest_walletModel.findOne({UserId: update_depositlog.userId});
            if (find_interest_wallet) {
              const update_interest_wallet = await stake_interest_walletModel.findOneAndUpdate({ UserId: update_depositlog.userId }, { total_amount: parseFloat(find_interest_wallet.total_amount) + parseFloat(monthly_payout)},{ new: true });
            } else {
              const schema1 = new stake_interest_walletModel();
              schema1.UserId = update_depositlog.userId;
              schema1.total_amount = parseFloat(monthly_payout);
              const create_interest_wallet = await stake_interest_walletModel.create(schema1);
            }
          });
        // }
        //  else if (find_deposit.interest_type == "yearly") {
        //   const schema1 = new intrest_historyModel();
        //   schema1.UserId = update_depositlog.userId;
        //   schema1.deposit_id = update_depositlog._id;
        //   schema1.transaction_id = transaction_id;
        //   schema1.staking_id = update_depositlog.staking_id;
        //   schema1.intrest_amount = parseFloat(annual_payout);
        //   schema1.amount = find_deposit.amount;
        //   schema1.status = true;
        //   schema1.interest_percentage = annual_pr;
        //   schema1.month = month;
        //   schema1.date = date;
        //   schema1.hours = hour;
        //   schema1.minute = min;
        //   schema1.interest_type = "yearly";
        //   schema1.deposit_type = update_depositlog.wallet_type;
        //   const create_history = await intrest_historyModel.create(schema1);
        //   console.log(create_history, "data");
        //   schedule.scheduleJob(
        //     `${min} ${hour} ${date} ${month + 1} *`,
        //     async () => {
        //       console.log(req.body, "data");
        //       const schema = new interest_logModel();
        //       schema.UserId = update_depositlog.userId;
        //       schema.intrest_amount = parseFloat(annual_payout);
        //       schema.status = "success";
        //       schema.payment_completed = true;
        //       schema.intrest_type = "yearly";
        //       schema.hours = hour;
        //       schema.date = date;
        //       schema.month = month + 1;
        //       schema.minute = min;
        //       schema.deposit_type = update_depositlog.wallet_type;
        //       const create_interest = await interest_logModel.create(schema);
        //       const find_interest_wallet = await stake_interest_walletModel.findOne({ UserId: update_depositlog.userId});
        //       if (find_interest_wallet) {
        //         const update_interest_wallet = await stake_interest_walletModel.findOneAndUpdate({ UserId: update_depositlog.userId }, { total_amount: find_interest_wallet.total_amount + parseFloat(annual_payout) },{ new: true });
        //       } else {
        //         const schema1 = new stake_interest_walletModel();
        //         schema1.UserId = update_depositlog.userId;
        //         schema1.total_amount = parseFloat(annual_payout);
        //         const create_interest_wallet = await stake_interest_walletModel.create(schema1);
        //       }
        //     }
        //   );
        // } 
        // else {
        //   res.status(200).send({
        //     data: null,
        //     message: "wrong Interest type1",
        //     status: 0,
        //   });
        // }
        // ending interest adding
        // referral add
        if (find_deposit) {
          if (find_user.refered_by) {
            const find_refuser = await userModel.findOne({ referal_id: find_user.refered_by});
            if (find_refuser) {
              const one_refer = (parseInt(find_deposit.amount) * 5) / 100;
              const four_refer = (parseInt(find_deposit.amount) * 4) / 100;
              const three_refer = (parseInt(find_deposit.amount) * 3) / 100;
              const last_refer = (parseInt(find_deposit.amount) * 1) / 100;
              const two_refer = (parseInt(find_deposit.amount) * 2) / 100;
              console.log(one_refer, "5%ref");
              console.log(two_refer, "2%ref");
              const find_refpayment = await referral_walletModel.findOne({userId: find_refuser._id});
              if (find_refpayment) {
                const update_refpayment = await referral_walletModel.findOneAndUpdate(
                  { userId: find_refuser._id },
                  { total_amount: parseFloat(find_refpayment.total_amount) + parseFloat(one_refer)},{ new: true });
                  const schema1 = new referrals_logModel()
                schema1.amount = parseFloat(one_refer)
                schema1.userId = find_refuser._id
                schema1.level = "l1"
                schema1.addedBy = find_user._id
                schema1.save()
                if (find_refuser.refered_by) {
                  const find_ref2 = await userModel.findOne({referal_id: find_refuser.refered_by });
                  if (find_ref2) {
                    const find_paymentref2 = await referral_walletModel.findOne({userId: find_ref2._id});
                    if (find_paymentref2) {
                      const update_ref2payment = await referral_walletModel.findOneAndUpdate(
                        { userId: find_ref2._id },
                        { total_amount: parseFloat(find_paymentref2.total_amount) + parseFloat(four_refer),}, 
                        { new: true });
                        const schema2 = new referrals_logModel()
                      schema2.amount = parseFloat(four_refer)
                      schema2.userId = find_ref2._id
                      schema2.level = "l2"
                      schema2.addedBy = find_user._id
                      schema2.save()
                      if (find_ref2.refered_by) {
                        const find_ref3 = await userModel.findOne({ referal_id: find_ref2.refered_by });
                        if (find_ref3) {
                          const find_paymentref3 = await referral_walletModel.findOne({userId: find_ref3._id});
                          if (find_paymentref3) {
                            const update_ref3payment = await referral_walletModel.findOneAndUpdate(
                              { userId: find_ref3._id },
                              { total_amount: parseFloat(find_paymentref3.total_amount) + parseFloat(three_refer), },{ new: true });
                              const schema3 = new referrals_logModel()
                            schema3.amount = parseFloat(three_refer)
                            schema3.userId = find_ref3._id
                            schema3.level = "l3"
                            schema3.addedBy = find_user._id
                            schema3.save()
                            if (find_ref3.refered_by) {
                              const find_ref4 = await userModel.findOne({ referal_id: find_ref3.refered_by });
                              if (find_ref4) {
                                const find_paymentref4 = await referral_walletModel.findOne({ userId: find_ref4._id});
                                if (find_paymentref4) {
                                  const update_ref4payment = await referral_walletModel.findOneAndUpdate(
                                    { userId: find_ref4._id },
                                     { total_amount: parseFloat(find_paymentref4.total_amount) + parseFloat(two_refer), },{ new: true });const schema4 = new referrals_logModel()
                                     schema4.amount = parseFloat(two_refer)
                                     schema4.userId = find_ref4._id
                                     schema4.level = "l4"
                                     schema4.addedBy = find_user._id
                                     schema4.save()
                                  if (find_ref4.refered_by) {
                                    const find_ref5 = await userModel.findOne({referal_id: find_ref4.refered_by});
                                    if (find_ref5) {
                                      const find_paymentref5 = await referral_walletModel.findOne({userId: find_ref5._id});
                                      if (find_paymentref5) {
                                        const update_ref5payment = await referral_walletModel.findOneAndUpdate(
                                          { userId: find_ref5._id },
                                           {total_amount: parseFloat( find_paymentref5.total_amount) + last_refer},{ new: true } );
                                           const schema5 = new referrals_logModel()
                                        schema5.amount = parseFloat(last_refer)
                                        schema5.userId = find_ref5._id
                                        schema5.level = "l5"
                                        schema5.addedBy = find_user._id
                                        schema5.save()
                                        if (update_ref5payment) {
                                          res.status(200).send({
                                            data: find_deposit,
                                            message: "deposit successful",
                                            status: 1,
                                            error: null,
                                          });
                                        }
                                      } else {
                                        res.status(200).send({
                                          data: find_deposit,
                                          message: "payment log created",
                                          status: 1,
                                          error: null,
                                        });
                                      }
                                    } else {
                                      res.status(200).send({
                                        data: find_deposit,
                                        message: "payment log created",
                                        status: 1,
                                        error: null,
                                      });
                                    }
                                  } else {
                                    res.status(200).send({
                                      data: find_deposit,
                                      message: "payment log created",
                                      status: 1,
                                      error: null,
                                    });
                                  }
                                } else {
                                  res.status(200).send({
                                    data: find_deposit,
                                    message: "payment log created",
                                    status: 1,
                                    error: null,
                                  });
                                }
                              } else {
                                res.status(200).send({
                                  data: find_deposit,
                                  message: "payment log created",
                                  status: 1,
                                  error: null,
                                });
                              }
                            } else {
                              res.status(200).send({
                                data: find_deposit,
                                message: "payment log created",
                                status: 1,
                                error: null,
                              });
                            }
                          } else {
                            res.status(200).send({
                              data: find_deposit,
                              message: "payment log created",
                              status: 1,
                              error: null,
                            });
                          }
                        } else {
                          res.status(200).send({
                            data: find_deposit,
                            message: "payment log created",
                            status: 1,
                            error: null,
                          });
                        }
                      } else {
                        res.status(200).send({
                          data: find_deposit,
                          message: "payment log created",
                          status: 1,
                          error: null,
                        });
                      }
                    } else {
                      res.status(200).send({
                        data: find_deposit,
                        message: "payment log created",
                        status: 1,
                        error: null,
                      });
                    }
                  } else {
                    res.status(200).send({
                      data: find_deposit,
                      message: "payment log created",
                      status: 1,
                      error: null,
                    });
                  }
                } else {
                  res.status(200).send({
                    data: find_deposit,
                    message: "payment log created",
                    status: 1,
                    error: null,
                  });
                }
              } else {
                res.status(200).send({
                  data: find_deposit,
                  message: "payment log created",
                  status: 1,
                  error: null,
                });
              }
            } else {
              res.status(200).send({
                data: find_deposit,
                message: "payment log created",
                status: 1,
                error: null,
              });
            }
          } else {
            res.status(200).send({
              data: find_deposit,
              message: "payment log created",
              status: 1,
              error: null,
            });
          }
        } else {
          res.status(200).send({
            data: find_deposit,
            message: "error in deposit",
            status: 0,
          });
        }
      }
      
        // referral add
      } else {
        res.status(200).send({
          data: null,
          message: "user not found",
          status: 0,
        });
      }
    } catch (error) {
      res.status(400).send({
        error: error,
        message: "error in deposit approvel",
        status: 0,
      });
    }
  },

  async get_deposit_data(req,res,next){
    try{
      const find_all = await deposit_dataModel.find().populate('userId').lean()
      if(find_all.length<1){
        res.status(200).send({
          data:null,
          message:"no data found",
          status:0
        })
      }else{
        res.status(200).send({
          data:find_all,
          message:"deposit data",
          status:1
        })
      }

    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in get deposit",
        status:0
      })
    }
  },

  async get_deposit_data(req,res,next){
    try{
      const find_all = await deposit_dataModel.find().populate('userId').lean()
      if(find_all.length<1){
        res.status(200).send({
          data:null,
          message:"no data found",
          status:0
        })
      }else{
        res.status(200).send({
          data:find_all,
          message:"deposit data",
          status:1
        })
      }

    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"Error in get deposit",
        status:0
      })
    }
  },

  async update_deposit(req,res,next){
    try{
      const find_one = await deposit_dataModel.find().lean();
      if(find_one){
        for(let i=0;i<find_one.length;i++){
        const update_deposit = await deposit_logModel.findOneAndUpdate({_id:find_one[i]._id},{
          wallet_type:"liquidity"
        },{new:true});
      }
        res.status(200).send({
          message:"update deposit",
          status:1
        })
      }
      else{
        res.status(200).send({
          data:null,
          message:"no data found",
          status:0
        })
      }
    }
    catch(error){
      res.status(400).send({
        error:error,
        message:"error in deposit update"
      })
    }
  },

  async get_reinvest_data(req,res,next){
    try{
      const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
      if(find_user){
        const find_intrest = await interest_walletModel.findOne({ UserId: find_user._id });
        const find_referral_earnings = await referral_walletModel.findOne({ userId: find_user._id });
        const find_net_staking = await net_staking_walletModel.findOne({UserId: find_user._id});
        console.log(find_intrest, "find_intrest");
        console.log(find_referral_earnings, "find_referral_earnings");
        console.log(find_net_staking, "find_net_staking");

        const total_withdrawal = parseFloat(find_intrest.total_amount)  + parseFloat(find_net_staking.total_amount) + parseFloat(find_referral_earnings.total_amount);
        console.log(total_withdrawal, "total_withdrawal");
        const price = await axios.get( "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b");
        console.log(price.data.pairs[0].priceUsd, "prices");
        const GGO_usd = price.data.pairs[0].priceUsd;
        const currency_value = 77.96;
        console.log(currency_value, "currency_value");
        const GGO_inr = parseFloat(currency_value * GGO_usd);
        const reinvest_crypto = parseFloat(total_withdrawal)/parseFloat(GGO_inr)
        res.status(200).send({
          data:{R_I_amount : total_withdrawal,
          R_I_crypto : reinvest_crypto},
          status:1,
          message:"reinvest data"
        })
      }else{
        res.status(200).send({
          data:null,
          status:0,
          message:"user not found"
        })
      }
    }catch(error){
      res.status(400).send({
        error:error,
        status:0,
        message:"error in reinvest data"
      })
    }
  }


  //   async timer_deposit(req,res,next){
  //     try{
  //       const d = new Date();
  //       let day = d.getDay();
  //       let month = d.getMonth()
  //       let date = d.getDate()
  //       let hour = d.getHours()
  //       let min = d.getMinutes()
  //       if(req.body.interest_type == 'weekly'){
  //         const schema1 = new intrest_historyModel()
  //         schema1.UserId = req.body.UserId
  //         schema1.deposit_id = id
  //         schema1.transaction_id = transaction_id
  //         schema1.staking_id = staking_id
  //         schema1.intrest_amount = amount
  //         schema1.day = day;
  //         schema1.hours = hour
  //         schema1.minute = min
  //         schema1.interest_type = 'weekly'
  //         const create_history = await intrest_historyModel.create(schema1);
  //         console.log(create_history,"data");
  //           schedule.scheduleJob(`${min} ${hour} * * ${day}`,async()=>{
  //             console.log(req.body,"data")
  //             const schema = new interest_logModel()
  //             schema.UserId = req.body.UserId
  //             schema.interest_amount = req.body.interest_amount
  //             schema.status = "success"
  //             schema.payment_completed = true
  //             schema.intrest_type = 'weekly'
  //             schema.hours = hour;
  //             schema.day = day;
  //             schema.minute = min;
  //             const create_interest = await interest_logModel.create(schema)
  //             const find_interest_wallet = await interest_walletModel.findOne({UserId:req.body.UserId})
  //             if(find_interest_wallet){
  //               const update_interest_wallet = await interest_walletModel.findOneAndUpdate({UserId:req.body.UserId},{
  //                 total_amount: (find_interest_wallet.total_amount) + req.body.interest_amount
  //               },{new:true})
  //             }
  //             else{
  //               const schema1 = new interest_walletModel()
  //               schema1.UserId = req.body.UserId
  //               schema1.total_amount = req.body.interest_amount
  //               const create_interest_wallet = await interest_walletModel.create(schema1)
  //             }
  //           })
  //       }else
  //       if(req.body.interest_type == 'monthly'){
  //         const schema1 = new intrest_historyModel()
  //         schema1.UserId = req.body.UserId
  //         schema1.deposit_id = id
  //         schema1.transaction_id = transaction_id
  //         schema1.staking_id = staking_id
  //         schema1.intrest_amount = amount
  //         schema1.date = date;
  //         schema1.hours = hour
  //         schema1.minute = min
  //         schema1.interest_type = 'monthly'
  //         const create_history = await intrest_historyModel.create(schema1);
  //         console.log(create_history,"data");
  //         schedule.scheduleJob(`${min} ${hour} ${date} * *`,async()=>{
  //           console.log(req.body,"data")
  //           const schema = new interest_logModel()
  //           schema.UserId = req.body.UserId
  //           schema.interest_amount = req.body.interest_amount
  //           schema.status = "success"
  //           schema.payment_completed = true
  //           schema.intrest_type = 'monthly'
  //           schema.hours = hour;
  //           schema.date = date
  //           schema.minute = min;
  //           const create_interest = await interest_logModel.create(schema)
  //           const find_interest_wallet = await interest_walletModel.findOne({UserId:req.body.UserId})
  //           if(find_interest_wallet){
  //             const update_interest_wallet = await interest_walletModel.findOneAndUpdate({UserId:req.body.UserId},{
  //               total_amount: (find_interest_wallet.total_amount) + req.body.interest_amount
  //             },{new:true})
  //           }
  //           else{
  //             const schema1 = new interest_walletModel()
  //             schema1.UserId = req.body.UserId
  //             schema1.total_amount = req.body.interest_amount
  //             const create_interest_wallet = await interest_walletModel.create(schema1)
  //           }
  //         })
  //       }else
  //       if(req.body.interest_type == 'yearly'){
  //         const schema1 = new intrest_historyModel()
  //         schema1.UserId = req.body.UserId
  //         schema1.deposit_id = id
  //         schema1.transaction_id = transaction_id
  //         schema1.staking_id = staking_id
  //         schema1.intrest_amount = amount
  //         schema1.month = month
  //         schema1.date = date;
  //         schema1.hours = hour
  //         schema1.minute = min
  //         schema1.interest_type = 'yearly'
  //         const create_history = await intrest_historyModel.create(schema1);
  //         console.log(create_history,"data");
  //         schedule.scheduleJob(`${min} ${hour} ${date} ${month+1} *`,async()=>{
  //           console.log(req.body,"data")
  //           const schema = new interest_logModel()
  //           schema.UserId = req.body.UserId
  //           schema.interest_amount = req.body.interest_amount
  //           schema.status = "success"
  //           schema.payment_completed = true
  //           schema.intrest_type = 'yearly'
  //           schema.hours = hour;
  //           schema.date = date
  //           schema.month = month+1
  //           schema.minute = min;
  //           const create_interest = await interest_logModel.create(schema)
  //           const find_interest_wallet = await interest_walletModel.findOne({UserId:req.body.UserId})
  //           if(find_interest_wallet){
  //             const update_interest_wallet = await interest_walletModel.findOneAndUpdate({UserId:req.body.UserId},{
  //               total_amount: (find_interest_wallet.total_amount) + req.body.interest_amount
  //             },{new:true})
  //           }
  //           else{
  //             const schema1 = new interest_walletModel()
  //             schema1.UserId = req.body.UserId
  //             schema1.total_amount = req.body.interest_amount
  //             const create_interest_wallet = await interest_walletModel.create(schema1)
  //           }
  //         })
  //     }else{
  //       res.status(200).send({
  //         data:null,
  //         message:"wrong Interest type",
  //         status:0
  //       })
  //     }
  //     }
  //     catch(error){
  //       res.status(400).send({
  //         error:error,
  //         message:"Error in deposit timer",
  //         status:0
  //       })
  //     }
  //   },

  //   async get_currency(req,res,next){
  //     try{
  //       const data = getSymbolFromCurrency
  //       res.status(200).send({data:data.currencySymbolMap})
  //     }
  //     catch(error){
  //       res.status(400).send({
  //         error:error,
  //         message:"error in get currency",
  //         status:0
  //       })
  //     }
  //   },
};
