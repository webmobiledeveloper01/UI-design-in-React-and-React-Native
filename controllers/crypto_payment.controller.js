const mongoose = require("mongoose");
const crypto_payoutsModel = require("../models/crypto_payments.model");
const userModel = require("../models/user.model");
const interest_walletModel = require("../models/interest_wallet.model");
const stake_interest_walletModel = require("../models/stake_interest_wallet.model");
const referral_walletModel = require("../models/referral_wallet.model");
const net_staking_walletModel = require("../models/net_staking_wallet.model");
const net_staking_withdrawal_logModel = require("../models/net_staking_withdrawal_log.model");
const interest_withdraw_logModel = require("../models/interest_withdraw_log.model");
const referral_withdraw_logModel = require("../models/referral_withdraw_log.model");
const otpGenerator = require("otp-generator");

module.exports = {
    async cryto_payouts_withdrawal(req, res, next){
        // var Idempotency = uuidv4();
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
                // if(find_user.add_withdraw){
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
                                    // if(find_user.Addreferral){
                                        wallet = await referral_walletModel.findOne({userId: req.body.UserId});
                                        wallet_amount=wallet.total_amount;
                                    // } else{
                                    //     return res.status(200).send({
                                    //         data:null,
                                    //         status:0,
                                    //         message:"you are unable to withdraw from referral wallet"
                                    //     })
                                    // }
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
                                    const find_payout_tax = await crypto_payoutsModel.find({UserId:req.body.UserId,createdAt:{ $lte: today_date},status:"Success"}).sort({_id:-1})
                                    console.log(find_payout_tax,"tax")
                                    var total_payout = 0
                                    for(let t=0;t<find_payout_tax.length;t++){
                                    total_payout = parseFloat(total_payout) + parseFloat(find_payout_tax[t].withdrawal_amount)
                                    }
                                    console.log(total_payout,'total_payout',find_payout_tax.length)
                                    if(total_payout>10000){
                                        const one = (parseFloat(req.body.withdrawal_amount)*10)/100
                                        const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one)
                                        const find_payout = await crypto_payoutsModel.find({UserId:req.body.UserId,createdAt:{ $gte: Date_date},status:"Success"}).sort({_id:-1})
                                        if(find_payout.length<1){
                                            if(req.body.withdrawal_amount >= 500){ // 1
                                                if(req.body.withdrawal_amount <= 3000){ 
                                                    const one = parseFloat((req.body.withdrawal_amount)*10/100);
                                                    const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one);
                                                    const schema = new crypto_payoutsModel()
                                                    schema.UserId = req.body.UserId
                                                    schema.email = "GGO@payment.com"
                                                    schema.phone_number = req.body.mobileno
                                                    schema.created_at = Date.now()
                                                    schema.remarks = req.body.remarks
                                                    schema.wallet_address = req.body.wallet_address
                                                    schema.network = req.body.network
                                                    schema.coins = req.body.coins
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
                                                    crypto_payoutsModel.create(schema).then(createPayout=>{
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
                                                            schema_create.crypto_withdrawal_id = createPayout._id
                                                            schema_create.wallet_type = req.body.transaction_type
                                                            net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111,"netstaking_wallet")})
                                                        }
                                                        if(req.body.wallet_type == 'interest_wallet'){
                                                            const schema_create1 = new interest_withdraw_logModel()
                                                            schema_create1.userId = req.body.UserId
                                                            schema_create1.amount = interest_amt
                                                            schema_create1.crypto_withdrawal_id = createPayout._id
                                                            schema_create1.wallet_type = req.body.transaction_type
                                                            interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                                                            
                                                            const schema_create = new interest_withdraw_logModel()
                                                            schema_create.userId = req.body.UserId
                                                            schema_create.amount = staking_amt
                                                            schema_create.crypto_withdrawal_id = createPayout._id
                                                            schema_create.wallet_type = "stake"
                                                            interest_withdraw_logModel.create(schema_create).then(data=>{console.log(data)})
                                                        }
                                                        if(req.body.wallet_type == 'referral_wallet'){
                                                        const schema_create2 = new referral_withdraw_logModel()
                                                        schema_create2.userId = req.body.UserId
                                                        schema_create2.amount = req.body.withdrawal_amount
                                                        schema_create2.crypto_withdrawal_id = createPayout._id
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
                                                            const schema = new crypto_payoutsModel()
                                                            schema.UserId = req.body.UserId
                                                            schema.remarks = req.body.remarks
                                                            schema.email = "GGO@payment.com"
                                                            schema.phone_number = req.body.mobileno
                                                            schema.created_at = Date.now()
                                                            schema.wallet_address = req.body.wallet_address
                                                            schema.network = req.body.network
                                                            schema.coins = req.body.coins
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
                                                            crypto_payoutsModel.create(schema).then(createPayout=>{
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
                                                                    schema_create.crypto_withdrawal_id = createPayout._id
                                                                    schema_create.wallet_type = req.body.transaction_type
                                                                    net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                                                                }
                                                                if(req.body.wallet_type == 'interest_wallet'){
                                                                    const schema_create = new interest_withdraw_logModel()
                                                                    schema_create.userId = req.body.UserId
                                                                    schema_create.amount = interest_amt
                                                                    schema_create.crypto_withdrawal_id = createPayout._id
                                                                    schema_create.wallet_type = req.body.transaction_type
                                                                    interest_withdraw_logModel.create(schema_create).then(data222=>{console.log(data222)})
                                                                    
                                                                    const schema_create1 = new interest_withdraw_logModel()
                                                                    schema_create1.userId = req.body.UserId
                                                                    schema_create1.amount = staking_amt
                                                                    schema_create1.crypto_withdrawal_id = createPayout._id
                                                                    schema_create1.wallet_type = "stake"
                                                                    interest_withdraw_logModel.create(schema_create1).then(data=>{console.log(data)})
                                                                }
                                                                if(req.body.wallet_type == 'referral_wallet'){
                                                                    const schema_create2 = new referral_withdraw_logModel()
                                                                    schema_create2.userId = req.body.UserId
                                                                    schema_create2.amount = req.body.withdrawal_amount
                                                                    schema_create2.crypto_withdrawal_id = createPayout._id
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
                                    } else{
                                        const find_payout = await crypto_payoutsModel
                                        .find({UserId:req.body.UserId,createdAt:{ $gte: Date_date},status:"Success"}).sort({_id:-1})
                                        if(find_payout.length<1){
                                            if(req.body.withdrawal_amount >= 500){ // 1
                                                if(req.body.withdrawal_amount <= 3000){ 
                                        const one = parseFloat((req.body.withdrawal_amount)*10/100);
                                        const finAmt = parseFloat(req.body.withdrawal_amount) - parseFloat(one);
                                        const schema = new crypto_payoutsModel()
                                        schema.UserId = req.body.UserId
                                        schema.coins = req.body.coins
                                        schema.email = "GGO@payment.com"
                                        schema.phone_number = req.body.mobileno
                                        schema.created_at = Date.now()
                                        schema.network = req.body.network
                                        schema.wallet_address = req.body.wallet_address
                                        schema.remarks = req.body.remarks
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
                                        crypto_payoutsModel.create(schema).then(createPayout=>{
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
                                            schema_create.crypto_withdrawal_id = createPayout._id
                                            schema_create.wallet_type = req.body.transaction_type
                                            net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111,"netstaking_wallet")})
                                            }
                                            if(req.body.wallet_type == 'interest_wallet'){
                                            const schema_create1 = new interest_withdraw_logModel()
                                            schema_create1.userId = req.body.UserId
                                            schema_create1.amount = interest_amt
                                            schema_create1.crypto_withdrawal_id = createPayout._id
                                            schema_create1.wallet_type = req.body.transaction_type
                                            interest_withdraw_logModel.create(schema_create1).then(data222=>{console.log(data222)})
                                            const schema_create = new interest_withdraw_logModel()
                                                schema_create.userId = req.body.UserId
                                                schema_create.amount = staking_amt
                                                schema_create.crypto_withdrawal_id = createPayout._id
                                                schema_create.wallet_type = "stake"
                                                interest_withdraw_logModel.create(schema_create).then(data=>{console.log(data)})
                                            }
                                            if(req.body.wallet_type == 'referral_wallet'){
                                                const schema_create2 = new referral_withdraw_logModel()
                                                schema_create2.userId = req.body.UserId
                                                schema_create2.amount = req.body.withdrawal_amount
                                                schema_create2.crypto_withdrawal_id = createPayout._id
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
                                            const schema = new crypto_payoutsModel()
                                            schema.UserId = req.body.UserId
                                            schema.coins = req.body.coins
                                            schema.email = "GGO@payment.com"
                                            schema.phone_number = req.body.mobileno
                                            schema.created_at = Date.now()
                                            schema.network = req.body.network
                                            schema.wallet_address = req.body.wallet_address
                                            schema.remarks = req.body.remarks
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
                                            crypto_payoutsModel.create(schema).then(createPayout=>{
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
                                                schema_create.crypto_withdrawal_id = createPayout._id
                                                schema_create.wallet_type = req.body.transaction_type
                                                net_staking_withdrawal_logModel.create(schema_create).then(data111=>{console.log(data111)})
                                                }
                                                if(req.body.wallet_type == 'interest_wallet'){
                                                const schema_create = new interest_withdraw_logModel()
                                                schema_create.userId = req.body.UserId
                                                schema_create.amount = interest_amt
                                                schema_create.crypto_withdrawal_id = createPayout._id
                                                schema_create.wallet_type = req.body.transaction_type
                                                interest_withdraw_logModel.create(schema_create).then(data222=>{console.log(data222)})
                                                const schema_create1 = new interest_withdraw_logModel()
                                                schema_create1.userId = req.body.UserId
                                                schema_create1.amount = staking_amt
                                                schema_create1.crypto_withdrawal_id = createPayout._id
                                                schema_create1.wallet_type = "stake"
                                                interest_withdraw_logModel.create(schema_create1).then(data=>{console.log(data)})
                                                }
                                                if(req.body.wallet_type == 'referral_wallet'){
                                                    const schema_create2 = new referral_withdraw_logModel()
                                                    schema_create2.userId = req.body.UserId
                                                    schema_create2.amount = req.body.withdrawal_amount
                                                    schema_create2.crypto_withdrawal_id = createPayout._id
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
                // }else{
                //     res.status(200).send({
                //     data: null,
                //     message: "Unable to Withdraw.",
                //     status: 0,
                //     });
                // }               
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