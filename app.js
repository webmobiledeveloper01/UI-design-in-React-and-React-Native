const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/router");
const depositRouter = require("./routes/deposit_router");
const payoutRouter = require("./routes/payout_router");
const digioRouter = require("./routes/digio_router");
const addCrypto = require("./routes/addCrypto.route");
const crypto_paymentRoute = require("./routes/crypto_payment.route")
const storyRoute = require("./routes/story.route");
const P2P_withdrawRoute = require("./routes/P2P_withdraw.route");
const deposit_cryptoRoute = require("./routes/deposit_crypto.route");
const media_linksRoute = require("./routes/media_links.router");
const fidyPayRouter = require("./routes/fidyPay.route")


const ejs = require("ejs");
const userModel = require("./models/user.model");
const net_staking_walletModel = require("./models/net_staking_wallet.model");
const payment_Model = require("./models/payment.model");
const intrest_historyModel = require("./models/interest_history.model");
const interest_logModel = require("./models/interest_log.model");
const interest_walletModel = require("./models/interest_wallet.model");
const reward_logsModel = require("./models/reward_logs.model");
const bankAccDetRoute = require("./routes/bank_account_details.route");
const agreementRoute = require('./routes/agreement.route');
const bitcoinRoute = require("./routes/bitcoin_data.router");
const stake_deposit_walletModel = require('./models/stake_deposit_wallet.model');
const stake_nsr_walletModel = require('./models/stake_nsr_wallet.model');
const stake_reward_logsModel = require('./models/stake_reward_logs.model');
const schedule = require("node-schedule");
const stake_interest_wallet = require('./models/stake_interest_wallet.model');
const paymentModel = require('./models/payment.model')
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const agreementModel = require('./models/agreement.model');
const deposit_reportsModel = require('./models/deposit_reports.model');
require("dotenv").config({ path: ".env" });

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    eventEmitter.emit("start");

    console.log("Connected to MongoDB ...");
  })
  .catch((err) => console.error("Could not connect to MongoDB:‌", err));

const app = express();
const http = require("http");
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const PORT = process.env.PORT;
const cors = require("cors")
// app.use(express.limit('4M'));
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://desktop.ggo.digital",
    "http://localhost:4200"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.header("Access-Control-Allow-Origin", [
  //   "https://desktop.ggo.digital",
  //   // "http://localhost:4200"
  // ]);
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  return next();
});
app.use("/apk", express.static("apk"));
app.use("/uploads", express.static("uploads"));
app.use("/deposit", express.static("deposit"));
app.use("/story", express.static("story"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/deposit", depositRouter);
app.use("/api/v1/payout", payoutRouter);
app.use("/api/v1/digio", digioRouter);
app.use('/api/v1/bankAccountDetails',bankAccDetRoute);
app.use("/api/v1/agreement",agreementRoute);
app.use("/api/v1/bitcoin",bitcoinRoute);
app.use("/api/v1/addCrypto",addCrypto);
app.use("/api/v1/crypto_payment",crypto_paymentRoute)
app.use("/api/v1/story",storyRoute);
app.use("/api/v1/P2P_withdraw",P2P_withdrawRoute);
app.use("/api/v1/deposit_crypto",deposit_cryptoRoute);
app.use("/api/v1/media_links",media_linksRoute);
app.use("/api/v1/fidyPay", fidyPayRouter);


app.get("/", (req, res) => {
  res.send("welcom to GGO");
});
app.get("/index", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log("data" + socket.id);
  // socket.on("new message",async(amount)=>{
  //     console.log(amount);
  //     const data1 = await
  //     socket.emit()
  // })
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.message = "Invalid route";
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.json({
    error: {
      message: error.message,
    },
  });
});
eventEmitter.on("start", () => {

  //isholiday update 
  schedule.scheduleJob("1 18 * * 5",()=>{
    agreementModel.findOneAndUpdate({type:"rewards"},{
      isHoliday:true
    },{new:true})
  })
  schedule.scheduleJob("1 9 * * 1",()=>{
    agreementModel.findOneAndUpdate({type:"rewards"},{
      isHoliday:false
    },{new:true})
  })
  //isholiday update
  //reward share for l2 - l14
  schedule.scheduleJob("1 3 * * *",async () => {
    userModel.find().lean().then(async(find_user)=>{
      console.log("data1")
  console.log(find_user.length,"user data");
for(let i=0;i<find_user.length;i++){
  let users = await userModel.findOne({ _id: find_user[i]._id}).select({ referal_id: 1, refered_by: 1 }).lean();
  let L1 = await userModel.find({ refered_by: users.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean();
  console.log(users,"users",i);
  let total = L1.length;
  let L1deposits = [];
  let L2 = []
  let L3 = []
  let depositTotal = 0;
  let L1Users = 0;
  //to L1 refers and deposits start
  L1.forEach(element => {
    L1Users += 1;
    L1deposits.push(deposit_logModel.find({ userId: element._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
    L2.push(userModel.find({ refered_by: element.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
  });

  //to L1 refers and deposits end

  //l1 deposit start
  let L1depositsOut = await Promise.all(L1deposits);
  L1depositsOut = L1depositsOut.filter(e => e.length);
  let L1Deposit = 0;
  L1depositsOut.forEach(element => {
    element.forEach(data => {
      L1Deposit += data.amount
    })
  })
  //l1 deposit end

  //l2 deposit start
  let l2 = await Promise.all(L2)
  let L2deposits = [];
  let L2Users = 0;
  let L2M = l2.filter(e => e.length);
  L2M.forEach(element => {
    element.forEach(data => {
      L2Users += 1
      L2deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L3.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });
  //l2 deposit start
  let L2depositsOut = await Promise.all(L2deposits);
  console.log('L2depositsOut', L2depositsOut)
  L2depositsOut = L2depositsOut.filter(e => e.length);
  let L2Deposit = 0;
  L2depositsOut.forEach(element => {
    element.forEach(data => {
      L2Deposit += data.amount
    })
  })

  //l2 deposit end



  let L4 = []
  let L3deposits = []
  let l3 = await Promise.all(L3)
  let L3M = l3.filter(e => e.length);
  let L3Users = 0;
  L3M.forEach(element => {
    element.forEach(data => {
      L3Users += 1
      L3deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L4.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L3Deposit = 0;
  let L3depositsOut = await Promise.all(L3deposits);
  L3depositsOut = L3depositsOut.filter(e => e.length);
  L3depositsOut.forEach(element => {
    element.forEach(data => {
      L3Deposit += data.amount
    })
  })
  //l3 deposit end



  let L5 = []
  let l4 = await Promise.all(L4)
  let L4M = l4.filter(e => e.length);
  let L4deposits = []
  let L4Users = 0;
  L4M.forEach(element => {
    element.forEach(data => {
      L4Users += 1
      L4deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L5.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L4depositsOut = await Promise.all(L4deposits);
  L4depositsOut = L4depositsOut.filter(e => e.length);
  let L4Deposit = 0;
  L4depositsOut.forEach(element => {
    element.forEach(data => {
      L4Deposit += data.amount
    })
  })
  //l3 deposit end


  let L6 = []
  let l5 = await Promise.all(L5)
  let L5M = l5.filter(e => e.length);
  let L5deposits = []
  let L5Users = 0;
  L5M.forEach(element => {
    element.forEach(data => {
      L5Users += 1
      L5deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L6.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L5depositsOut = await Promise.all(L5deposits);
  L5depositsOut = L5depositsOut.filter(e => e.length);
  let L5Deposit = 0;
  L5depositsOut.forEach(element => {
    element.forEach(data => {
      L5Deposit += data.amount
    })
  })
  //l3 deposit end

  let L7 = []
  let l6 = await Promise.all(L6)
  let L6deposits = []
  let L6M = l6.filter(e => e.length);
  let L6Users = 0;
  L6M.forEach(element => {
    element.forEach(data => {
      L6Users += 1
      L6deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L7.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L6depositsOut = await Promise.all(L6deposits);
  L6depositsOut = L6depositsOut.filter(e => e.length);
  let L6Deposit = 0;
  L6depositsOut.forEach(element => {
    element.forEach(data => {
      L6Deposit += data.amount
    })
  })
  //l3 deposit end


  let L8 = []
  let l7 = await Promise.all(L7)
  let L7M = l7.filter(e => e.length);
  let L7deposits = []
  let L7Users = 0;
  L7M.forEach(element => {
    element.forEach(data => {
      L7Users += 1
      L7deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L8.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L7depositsOut = await Promise.all(L7deposits);
  L7depositsOut = L7depositsOut.filter(e => e.length);
  let L7Deposit = 0;
  L7depositsOut.forEach(element => {
    element.forEach(data => {
      L7Deposit += data.amount
    })
  })
  //l3 deposit end


  let L9 = []
  let l8 = await Promise.all(L8)
  let L8M = l8.filter(e => e.length);
  let L8deposits = []
  let L8Users = 0;
  L8M.forEach(element => {
    element.forEach(data => {
      L8Users += 1
      L8deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L9.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L8depositsOut = await Promise.all(L8deposits);
  L8depositsOut = L8depositsOut.filter(e => e.length);
  let L8Deposit = 0;
  L8depositsOut.forEach(element => {
    element.forEach(data => {
      L8Deposit += data.amount
    })
  })
  //l3 deposit end

  let L10 = []
  let l9 = await Promise.all(L9)
  let L9M = l9.filter(e => e.length);
  let L9deposits = []
  let L9Users = 0;
  L9M.forEach(element => {
    element.forEach(data => {
      L9Users += 1
      L9deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L10.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });
  //l3 deposit start
  let L9depositsOut = await Promise.all(L9deposits);
  let L9Deposit = 0;
  L9depositsOut = L9depositsOut.filter(e => e.length);
  L9depositsOut.forEach(element => {
    element.forEach(data => {
      L9Deposit += data.amount
    })
  })
  //l3 deposit end

  let L11 = []
  let l10 = await Promise.all(L10)
  let L10M = l10.filter(e => e.length);
  let L10deposits = []
  let L10Users = 0;
  L10M.forEach(element => {
    element.forEach(data => {
      L10Users += 1
      L10deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L11.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });
  //l3 deposit start
  let L10depositsOut = await Promise.all(L10deposits);
  let L10Deposit = 0;
  L10depositsOut = L10depositsOut.filter(e => e.length);
  L10depositsOut.forEach(element => {
    element.forEach(data => {
      L10Deposit += data.amount
    })
  })
  //l3 deposit end


  let L12 = []
  let l11 = await Promise.all(L11)
  let L11M = l11.filter(e => e.length);
  let L11deposits = []
  let L11Users = 0;
  L11M.forEach(element => {
    element.forEach(data => {
      L11Users += 1
      L11deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L12.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });
  //l3 deposit start
  let L11depositsOut = await Promise.all(L11deposits);
  L11depositsOut = L11depositsOut.filter(e => e.length);
  let L11Deposit = 0;
  L11depositsOut.forEach(element => {
    element.forEach(data => {
      L11Deposit += data.amount
    })
  })
  //l3 deposit end

  let L13 = []
  let l12 = await Promise.all(L12)
  let L12M = l12.filter(e => e.length);
  let L12deposits = []
  let L12Users = 0;
  L12M.forEach(element => {
    element.forEach(data => {
      L11Users += 1;
      L12deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L13.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });
  //l3 deposit start
  let L12depositsOut = await Promise.all(L12deposits);
  L12depositsOut = L12depositsOut.filter(e => e.length);
  let L12Deposit = 0;
  L12depositsOut.forEach(element => {
    element.forEach(data => {
      L12Deposit += data.amount
    })
  })

  //l3 deposit end

  let L14 = []
  let l13 = await Promise.all(L13)
  let L13M = l13.filter(e => e.length);
  let L13deposits = []
  let L13Users = 0;
  L13M.forEach(element => {
    element.forEach(data => {
      L13Users += 1
      L13deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L14.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  //l3 deposit start
  let L13depositsOut = await Promise.all(L13deposits);
  L13depositsOut = L13depositsOut.filter(e => e.length);
  let L13Deposit = 0;
  L13depositsOut.forEach(element => {
    element.forEach(data => {
      L13Deposit += data.amount
    })
  })

  //l3 deposit end

  let L15 = []
  let l14 = await Promise.all(L14)
  let L14M = l14.filter(e => e.length);
  let L14deposits = []
  let L14Users = 0;
  L14M.forEach(element => {
    element.forEach(data => {
      L14Users += 1
      L14deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
      L15.push(userModel.find({ refered_by: data.referal_id }).select({ _id: 1, referal_id: 1, refered_by: 1 }).lean());
    })
  });

  let L14depositsOut = await Promise.all(L14deposits);
  L14depositsOut = L14depositsOut.filter(e => e.length);
  let L14Deposit = 0;
  L14depositsOut.forEach(element => {
    element.forEach(data => {
      L14Deposit += data.amount
    })
  })
  //l3 deposit start
  let l15 = await Promise.all(L15)
  let L15M = l15.filter(e => e.length);
  let L15Users = 0;
  let L15deposits = []
  L15M.forEach(element => {
    element.forEach(data => {
      L15Users += 1
      L15deposits.push(deposit_logModel.find({ userId: data._id, status: 'Success', $or: [{ "paymentType": "GGO-ADMIN" }, { "paymentType": "GGO-wallet" }, { "paymentType": "Reinvest" }] }).select({ amount: 1 }).lean())
    })
  });

  let L15depositsOut = await Promise.all(L15deposits);
  L15depositsOut = L15depositsOut.filter(e => e.length);
  let L15Deposit = 0;
  L15depositsOut.forEach(element => {
    element.forEach(data => {
      L15Deposit += data.amount
    })
  })

  let shared_1 = L1Deposit + L2Deposit + L3Deposit + L4Deposit;
  let shared_2 = L5Deposit + L6Deposit + L7Deposit + L9Deposit;
  let shared_3 = L10Deposit + L11Deposit + L12Deposit + L13Deposit;
  let shared_1_amount = 0;
  let shared_2_amount = 0;
  let shared_3_amount = 0;
  if (shared_1 >= 500000) {
    console.log("1")
    shared_1_amount = shared_1 * 0.005 * 0.55
    const price = await axios.get( "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b");
        // console.log(price.data.pairs[0].priceUsd, "prices");
        const GGO_usd = price.data.pairs[0].priceUsd;
        const currency_value = 77.96;
        // console.log(currency_value, "currency_value");
        const GGO_inr = parseFloat(currency_value * GGO_usd);
        // console.log(GGO_inr, "GGO_inr");
        const add_ggo = parseFloat(shared_1_amount)/parseFloat(GGO_inr)
        paymentModel.findOne({userId:find_user[i]._id}).then(addGgo=>{
          console.log(addGgo,"addGgo")
          paymentModel.findOneAndUpdate({userId:find_user[i]._id},{crypto:parseFloat(addGgo.crypto)+parseFloat(add_ggo)}
        ,{new:true}).then(payment_log=>{console.log(payment_log)})})
        const schema = new reward_logsModel()
        schema.userId = find_user[i]._id
        schema.final_amount = add_ggo
        schema.reward_type = "reward share crypto"
        schema.save()   
    net_staking_walletModel.findOne({UserId:find_user[i]._id}).then(userData=>{
    net_staking_walletModel.findOneAndUpdate({UserId:find_user[i]._id},{
                    total_amount:parseFloat(userData.total_amount) + parseFloat(shared_1_amount)
                  },{new:true}).then(update_shared_wallet=>{
                  const schema = new reward_logsModel()
                  schema.userId = find_user[i]._id
                  schema.crypto = add_ggo
                  schema.final_amount = shared_1_amount
                  schema.reward_type = "reward share amount"
                  schema.save()
        let date_d = new Date()
        let month_d = date_d.getMonth();
        let year_d = date_d.getFullYear();
        deposit_reportsModel.findOne({userId:find_user[i]._id,month:month_d+1,year:year_d}).lean().then(find_depositreport=>{
        if(find_depositreport){
          deposit_reportsModel.findOneAndUpdate({_id:find_depositreport._id},{
            sharedRewards: parseFloat(find_depositreport.sharedRewards) + parseFloat(shared_1_amount),
            rewardsharecrypto:parseFloat(find_depositreport.rewardsharecrypto) + parseFloat(add_ggo)
          },{new:true}).then(update_depositreport=>{
          console.log(update_depositreport,"update_depositreport")})
        }else{
          const schema = new deposit_reportsModel()
          schema.userId= find_user[i]._id
          schema.ggoWallet = 0
          schema.reinvest_amount =  0
          schema.admin_deposit = 0
          schema.month = month_d+1
          schema.year = year_d
          schema.referralId = find_user[i].referal_id
          schema.referralBy = find_user[i].refered_by
          schema.sharedRewards = shared_1_amount
          schema.rewardsharecrypto = add_ggo
          schema.save()
        }
      })

                  })
                })
      
  }
  if (shared_2 >= 2500000) {

    console.log("2")
    shared_2_amount = shared_2 * 0.005 * 0.3
    const price = await axios.get( "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b");
    // console.log(price.data.pairs[0].priceUsd, "prices");
    const GGO_usd = price.data.pairs[0].priceUsd;
    const currency_value = 77.96;
    // console.log(currency_value, "currency_value");
    const GGO_inr = parseFloat(currency_value * GGO_usd);
    // console.log(GGO_inr, "GGO_inr");
    const add_ggo = parseFloat(shared_2_amount)/parseFloat(GGO_inr)
    paymentModel.findOne({userId:find_user[i]._id}).then(addGgo=>{
      console.log(addGgo,"addGgo")
      paymentModel.findOneAndUpdate({userId:find_user[i]._id},{crypto:parseFloat(addGgo.crypto)+parseFloat(add_ggo)}
    ,{new:true}).then(payment_log=>{console.log(payment_log)})})
    const schema = new reward_logsModel()
    schema.userId = find_user[i]._id
    schema.final_amount = add_ggo
    schema.reward_type = "reward share crypto"
    schema.save()   
    net_staking_walletModel.findOne({UserId:find_user[i]._id}).then(userData=>{
      net_staking_walletModel.findOneAndUpdate({UserId:find_user[i]._id},{
                      total_amount:parseFloat(userData.total_amount) + parseFloat(shared_2_amount)
                    },{new:true}).then(update_shared_wallet=>{
                    const schema = new reward_logsModel()
                    schema.userId = find_user[i]._id
                    schema.crypto = add_ggo
                    schema.final_amount = shared_2_amount
                    schema.reward_type = "reward share amount"
                    schema.save()

                    let date_d = new Date()
        let month_d = date_d.getMonth();
        let year_d = date_d.getFullYear();
        deposit_reportsModel.findOne({userId:find_user[i]._id,month:month_d+1,year:year_d}).lean().then(find_depositreport=>{
        if(find_depositreport){
          deposit_reportsModel.findOneAndUpdate({_id:find_depositreport._id},{
            sharedRewards: parseFloat(find_depositreport.sharedRewards) + parseFloat(shared_2_amount),
            rewardsharecrypto:parseFloat(find_depositreport.rewardsharecrypto) + parseFloat(add_ggo)
          },{new:true}).then(update_depositreport=>{
          console.log(update_depositreport,"update_depositreport")})
        }else{
          const schema = new deposit_reportsModel()
          schema.userId= find_user[i]._id
          schema.ggoWallet = 0
          schema.reinvest_amount =  0
          schema.admin_deposit = 0
          schema.month = month_d+1
          schema.year = year_d
          schema.referralId = find_user[i].referal_id
          schema.referralBy = find_user[i].refered_by
          schema.sharedRewards = shared_2_amount
          schema.rewardsharecrypto = add_ggo
          schema.save()
        }
      })
                    })
                  })
  }
  if (shared_3 >= 5000000) {
    console.log("3")

    shared_3_amount = shared_3 * 0.005 * 0.2
    const price = await axios.get( "https://api.dexscreener.io/latest/dex/pairs/bsc/0xD454352eEeE4269f292404A7d99fb78c4d5CB55b");
    // console.log(price.data.pairs[0].priceUsd, "prices");
    const GGO_usd = price.data.pairs[0].priceUsd;
    const currency_value = 77.96;
    // console.log(currency_value, "currency_value");
    const GGO_inr = parseFloat(currency_value * GGO_usd);
    // console.log(GGO_inr, "GGO_inr");
    const add_ggo = parseFloat(shared_3_amount)/parseFloat(GGO_inr)
    paymentModel.findOne({userId:find_user[i]._id}).then(addGgo=>{
      console.log(addGgo,"addGgo")
      paymentModel.findOneAndUpdate({userId:find_user[i]._id},{crypto:parseFloat(addGgo.crypto)+parseFloat(add_ggo)}
    ,{new:true}).then(payment_log=>{console.log(payment_log)})})
    const schema = new reward_logsModel()
    schema.userId = find_user[i]._id
    schema.final_amount = add_ggo
    schema.reward_type = "reward share crypto"
    schema.save()   
    net_staking_walletModel.findOne({UserId:find_user[i]._id}).then(userData=>{
      net_staking_walletModel.findOneAndUpdate({UserId:find_user[i]._id},{
                      total_amount:parseFloat(userData.total_amount) + parseFloat(shared_3_amount)
                    },{new:true}).then(update_shared_wallet=>{
                    const schema = new reward_logsModel()
                    schema.userId = find_user[i]._id
                    schema.final_amount = shared_3_amount
                    schema.crypto = add_ggo
                    schema.reward_type = "reward share amount"
                    schema.save()
                    let date_d = new Date()
        let month_d = date_d.getMonth();
        let year_d = date_d.getFullYear();
        deposit_reportsModel.findOne({userId:find_user[i]._id,month:month_d+1,year:year_d}).lean().then(find_depositreport=>{
        if(find_depositreport){
          deposit_reportsModel.findOneAndUpdate({_id:find_depositreport._id},{
            sharedRewards: parseFloat(find_depositreport.sharedRewards) + parseFloat(shared_3_amount),
            rewardsharecrypto:parseFloat(find_depositreport.rewardsharecrypto) + parseFloat(add_ggo)
          },{new:true}).then(update_depositreport=>{
          console.log(update_depositreport,"update_depositreport")})
        }else{
          const schema = new deposit_reportsModel()
          schema.userId= find_user[i]._id
          schema.ggoWallet = 0
          schema.reinvest_amount =  0
          schema.admin_deposit = 0
          schema.month = month_d+1
          schema.year = year_d
          schema.referralId = find_user[i].referal_id
          schema.referralBy = find_user[i].refered_by
          schema.sharedRewards = shared_3_amount
          schema.rewardsharecrypto = add_ggo
          schema.save()
        }
      })
                    })  
                  })
  }
  let output =
  {
    shared_1_amount, shared_2_amount, shared_3_amount
  }
}
})

    })
  //reward share end l2 - l14

  //   net staking rewards
  schedule.scheduleJob("1 3 * * *",()=>{
    userModel
    .find({ first_deposit: false ,add_nsr:false,demoAccount:{$ne:true}})
    .lean()
    .then((find_user) => {
      if (find_user) {
        console.log(find_user.length, "length");
        for (let i = 0; i < find_user.length; i++) {
          if(find_user[i]._id != "62b44e566435715b72b004ac"){
          payment_Model
            .findOne({ userId: find_user[i]._id })
            .lean()
            .then((find_deposit) => {
              let stak_reward;
              stak_reward = (parseFloat(find_deposit.total_amount) * 67 )/10000
              
              console.log(stak_reward, "stak_reward");
              
              var gas_fee= parseFloat((stak_reward)*16.2/100);
              var trans_fee= parseFloat((stak_reward)*3/100);
              var bridging_fee = parseFloat((stak_reward)*4/100);
              var tds = parseFloat((stak_reward)*1/100);
              var fees = parseFloat(gas_fee+trans_fee+bridging_fee+tds);
              var final_amount = parseFloat(stak_reward) - parseFloat(fees);
                net_staking_walletModel
                  .findOne({ UserId: find_deposit.userId })
                  .then((result) => {
                    // console.log(result,"result")
                    const schema = new reward_logsModel();
                        schema.userId = find_deposit.userId;
                        schema.previous_rewards = result.total_amount;  
                        schema.added_rewards = stak_reward;
                        schema.gas_fee = gas_fee;
                        schema.transaction_fee = trans_fee;
                        schema.bridging_fee = bridging_fee;
                        schema.tds = tds;
                        schema.fees = fees;
                        schema.final_amount = final_amount
                        reward_logsModel.create(schema)
                    net_staking_walletModel
                      .findOneAndUpdate(
                        { UserId: find_deposit.userId },
                        {
                          total_amount:
                            parseFloat(result.total_amount) +
                            parseFloat(final_amount),
                        },
                        { new: true }
                      )
                      .then((data1) => {
                        // console.log(data1);
                      });
                  });
             
              // Intervel(find_deposit,stak_reward,true)
            });
          }
        }
      }
      //   console.log({
      //     message:"Adding net staking rewards",
      //     status:1,
      //     error:null
      //   })
    });
  })
  //net staking reward send
  //stake nsr
  schedule.scheduleJob("1 3 * * *",()=>{
    userModel
    .find({ first_deposit: false,add_nsr:false })
    .lean()
    .then((find_user) => {
      if (find_user) {
        console.log(find_user.length, "length");
        for (let i = 0; i < find_user.length; i++) {
          stake_deposit_walletModel
            .findOne({ userId: find_user[i]._id })
            .lean()
            .then((find_deposit) => {
              let stak_reward;
              stak_reward = (parseFloat(find_deposit.total_amount) * 91 )/10000
              
              console.log(stak_reward, "stak_reward");
              
              var gas_fee= parseFloat((stak_reward)*16.2/100);
              var trans_fee= parseFloat((stak_reward)*3/100);
              var bridging_fee = parseFloat((stak_reward)*4/100);
              var tds = parseFloat((stak_reward)*1/100);
              var fees = parseFloat(gas_fee+trans_fee+bridging_fee+tds);
              var final_amount = parseFloat(stak_reward) - parseFloat(fees);
              stake_nsr_walletModel
                  .findOne({ UserId: find_deposit.userId })
                  .then((result) => {
                    // console.log(result,"result")
                    const schema = new stake_reward_logsModel();
                        schema.userId = find_deposit.userId;
                        schema.previous_rewards = result.total_amount;  
                        schema.added_rewards = stak_reward;
                        schema.gas_fee = gas_fee;
                        schema.transaction_fee = trans_fee;
                        schema.bridging_fee = bridging_fee;
                        schema.tds = tds;
                        schema.fees = fees;
                        schema.final_amount = final_amount;
                        stake_reward_logsModel.create(schema)
                        stake_nsr_walletModel
                      .findOneAndUpdate(
                        { UserId: find_deposit.userId },
                        {
                          total_amount:
                            parseFloat(result.total_amount) +
                            parseFloat(final_amount),
                        },
                        { new: true }
                      )
                      .then((data1) => {
                        // console.log(data1);
                      });
                  });
             
              // Intervel(find_deposit,stak_reward,true)
            });
        }
      }
      //   console.log({
      //     message:"Adding net staking rewards",
      //     status:1,
      //     error:null
      //   })
    });
  })
  //stake nsr end
  //demo nsr
  schedule.scheduleJob("1 3 * * *",()=>{
    userModel
    .find({first_deposit: false,add_nsr:false,demoAccount:true})
    .lean()
    .then((find_user) => {
      if (find_user) {
        console.log(find_user.length, "length");
        for (let i = 0; i < find_user.length; i++) {
          payment_Model
            .findOne({ userId: find_user[i]._id })
            .lean()
            .then((find_deposit) => {
              let stak_reward;
              stak_reward = (parseFloat(find_deposit.total_amount) * 26 )/10000
              
              console.log(stak_reward, "stak_reward");
              
              // var gas_fee= parseFloat((stak_reward)*16.2/100);
              // var trans_fee= parseFloat((stak_reward)*3/100);
              // var bridging_fee = parseFloat((stak_reward)*4/100);
              // var tds = parseFloat((stak_reward)*1/100);
              // var fees = parseFloat(gas_fee+trans_fee+bridging_fee+tds);
              // var final_amount = parseFloat(stak_reward) - parseFloat(fees);
                net_staking_walletModel
                  .findOne({ UserId: find_deposit.userId })
                  .then((result) => {
                    // console.log(result,"result")
                    const schema = new reward_logsModel();
                        schema.userId = find_deposit.userId;
                        schema.previous_rewards = result.total_amount;  
                        schema.added_rewards = stak_reward;
                        schema.gas_fee = 0;
                        schema.transaction_fee = 0;
                        schema.bridging_fee = 0;
                        schema.tds = 0;
                        schema.fees = 0;
                        schema.final_amount = stak_reward
                        reward_logsModel.create(schema)
                    net_staking_walletModel
                      .findOneAndUpdate(
                        { UserId: find_deposit.userId },
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
             
              // Intervel(find_deposit,stak_reward,true)
            });
        }
      }
      //   console.log({
      //     message:"Adding net staking rewards",
      //     status:1,
      //     error:null
      //   })
    });
  })
  //demo nsr end
  // reschedule interest
  intrest_historyModel.find().then((deposit_hist) => {
    // console.log(deposit_hist,'deposit_hist');
    for (let i = 0; i < deposit_hist.length; i++) {
      console.log(i, "data");
      if (deposit_hist[i].interest_type == "weekly") {
        schedule.scheduleJob(
          `${deposit_hist[i].minute} ${deposit_hist[i].hours} * * ${deposit_hist[i].day}`,
          async () => {
            const schema = new interest_logModel();
            schema.UserId = deposit_hist[i].UserId;
            schema.deposit_id = deposit_hist[i].deposit_id;
            schema.transaction_id = deposit_hist[i].transaction_id;
            schema.staking_id = deposit_hist[i].staking_id;
            schema.intrest_amount = parseFloat(deposit_hist[i].intrest_amount);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "weekly";
            schema.day = deposit_hist[i].day;
            schema.hours = deposit_hist[i].hours;
            schema.minute = deposit_hist[i].minute;
            if(deposit_hist[i].wallet_type){
              schema.wallet_type = deposit_hist[i].wallet_type;
            }
            const create_interest = await interest_logModel.create(schema);
            if(deposit_hist[i].wallet_type == "stake"){
              const find_interest_wallet = await stake_interest_wallet.findOne({
                UserId: deposit_hist[i].UserId,
              });
              if (find_interest_wallet) {
                const update_interest_wallet =
                  await stake_interest_wallet.findOneAndUpdate(
                    { UserId: deposit_hist[i].UserId },
                    {
                      total_amount:
                        parseFloat(find_interest_wallet.total_amount) +
                        parseFloat(deposit_hist[i].intrest_amount),
                    },
                    { new: true }
                  );
              }
            }else{
              const find_interest_wallet = await interest_walletModel.findOne({
                UserId: deposit_hist[i].UserId,
              });
              if (find_interest_wallet) {
                const update_interest_wallet =
                  await interest_walletModel.findOneAndUpdate(
                    { UserId: deposit_hist[i].UserId },
                    {
                      total_amount:
                        parseFloat(find_interest_wallet.total_amount) +
                        parseFloat(deposit_hist[i].intrest_amount),
                    },
                    { new: true }
                  );
              }
            }
           
          }
        );
      } else if (deposit_hist[i].interest_type == "monthly") {
        schedule.scheduleJob(
          `${deposit_hist[i].minute} ${deposit_hist[i].hours} ${deposit_hist[i].date} * *`,
          async () => {
            const schema = new interest_logModel();
            schema.UserId = deposit_hist[i].UserId;
            schema.deposit_id = deposit_hist[i].deposit_id;
            schema.transaction_id = deposit_hist[i].transaction_id;
            schema.staking_id = deposit_hist[i].staking_id;
            schema.intrest_amount = parseFloat(deposit_hist[i].intrest_amount);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "monthly";
            schema.hours = deposit_hist[i].hours;
            schema.date = deposit_hist[i].date;
            schema.minute = deposit_hist[i].minute;
            if(deposit_hist[i].wallet_type){
              schema.wallet_type = deposit_hist[i].wallet_type;
            }
            const create_interest = await interest_logModel.create(schema);
            if(deposit_hist[i].wallet_type == "stake"){
              const find_interest_wallet = await stake_interest_wallet.findOne({
                UserId: deposit_hist[i].UserId,
              });
              if (find_interest_wallet) {
                const update_interest_wallet =
                  await stake_interest_wallet.findOneAndUpdate(
                    { UserId: deposit_hist[i].UserId },
                    {
                      total_amount:
                        parseFloat(find_interest_wallet.total_amount) +
                        parseFloat(deposit_hist[i].intrest_amount),
                    },
                    { new: true }
                  );
              }
            }else{
            const find_interest_wallet = await interest_walletModel.findOne({
              UserId: deposit_hist[i].UserId,
            });
            if (find_interest_wallet) {
              const update_interest_wallet =
                await interest_walletModel.findOneAndUpdate(
                  { UserId: deposit_hist[i].UserId },
                  {
                    total_amount:
                      parseFloat(find_interest_wallet.total_amount) +
                      parseFloat(deposit_hist[i].intrest_amount),
                  },
                  { new: true }
                );
            }
          }
          }
        );
      } else if (deposit_hist[i].interest_type == "yearly") {
        schedule.scheduleJob(
          `${deposit_hist[i].minute} ${deposit_hist[i].hours} ${
            deposit_hist[i].date
          } ${deposit_hist[i].month + 1} *`,
          async () => {
            const schema = new interest_logModel();
            schema.UserId = deposit_hist[i].UserId;
            schema.deposit_id = deposit_hist[i].deposit_id;
            schema.transaction_id = deposit_hist[i].transaction_id;
            schema.staking_id = deposit_hist[i].staking_id;
            schema.intrest_amount = parseFloat(deposit_hist[i].intrest_amount);
            schema.status = "success";
            schema.payment_completed = true;
            schema.intrest_type = "yearly";
            schema.hours = deposit_hist[i].hours;
            schema.date = deposit_hist[i].date;
            schema.month = deposit_hist[i].month + 1;
            schema.minute = deposit_hist[i].minute;
            if(deposit_hist[i].wallet_type){
              schema.wallet_type = deposit_hist[i].wallet_type;
            }
            const create_interest = await interest_logModel.create(schema);
            if(deposit_hist[i].wallet_type == "stake"){
              const find_interest_wallet = await stake_interest_wallet.findOne({
                UserId: deposit_hist[i].UserId,
              });
              if (find_interest_wallet) {
                const update_interest_wallet =
                  await stake_interest_wallet.findOneAndUpdate(
                    { UserId: deposit_hist[i].UserId },
                    {
                      total_amount:
                        parseFloat(find_interest_wallet.total_amount) +
                        parseFloat(deposit_hist[i].intrest_amount),
                    },
                    { new: true }
                  );
              }
            }else{
            const find_interest_wallet = await interest_walletModel.findOne({
              UserId: deposit_hist[i].UserId,
            });
            if (find_interest_wallet) {
              const update_interest_wallet =
                await interest_walletModel.findOneAndUpdate(
                  { UserId: deposit_hist[i].UserId },
                  {
                    total_amount:
                      parseFloat(find_interest_wallet.total_amount) +
                      parseFloat(deposit_hist[i].intrest_amount),
                  },
                  { new: true }
                );
            }
          }
          }
        );
      } else {
        console.log({
          data: null,
          message: "error",
          status: 0,
        });
      }
    }
    console.log({
      message: "rescheduled",
    });
  });
  //  reschedule interest
});
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
