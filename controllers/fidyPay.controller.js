const axios = require("axios");
const express = require("express");
const impsBankAccountModel = require("../models/impsBankAccount.model");
const impsDataModel = require("../models/impsData.model");
const userModel = require("../models/user.model");
const fidypayWebhookModel = require("../models/fidypay_webhook.model");


exports.bankInfoRegistOtp = async (req, res) => {
  try {
    var data = JSON.stringify({
      bankId: req.body.bankName,
      merchantBankAccountNumber: req.body.accountNumber,
      merchantBankIfsc: req.body.ifscCode,
    });

    var config = {
      method: "post",
      url: "https://developer.fidypay.com/payout/v3/bankInfoRegisterOtp",
      headers: {
        "Client-Id": "0Xv+UAnlOVQf6vFkAmKU3A==",
        "Client-Secret": "Ya1G9KAmyQvz+8uvRkdjeMflrMwCrQ2zBhUPBoNUGc0=",
        Authorization: "Basic U3Jpa2FudGE6U01AMTIz",
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(response.data)
        impsBankAccountModel.findOneAndUpdate({ UserId: req.body.UserId },
          {UserId: req.body.UserId,
            bankName: req.body.bankName,
            bankAccNo: req.body.accountNumber,
            bankIfscCode: req.body.ifscCode,
            token: response.data.token,
          },
          { new: true, upsert: true }
        ).then(resp=>{
          console.log(resp,"resp")
        })
        res.status(200).send({
          data: response.data,
          error: null,
          status: 1,
          message: "Successfully registered",
        });
      })
      .catch(function (error) {
        res.status(400).send({
          data: null,
          error: error,
          status: 0,
          message: "Error in registering otp",
        });
      });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in registering otp",
    });
  }
};

exports.bankInfoRegister = async (req, res) => {
  try {
    const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
    if(find_user){
      const find_imps_details = await impsBankAccountModel.findOne({UserId:find_user._id}).lean()
    var data = JSON.stringify({
      accountTypeId: "27",
      bankId: find_imps_details.bankName,
      merchantBankAccountNumber: find_imps_details.bankAccNumber,
      merchantBankIfsc: find_imps_details.bankIfscCode,
      otp: req.body.otp,
      p1: "Pass corporate Id",
      p2: "",
      p3: "",
      p4: "",
      p5: "",
      p6: "",
      remark: "no",
      token: find_imps_details.token,
    });

    var config = {
      method: "post",
      url: "https://developer.fidypay.com/payout/v3/merchantBankInfoRegister",
      headers: {
        "Client-Id": "0Xv+UAnlOVQf6vFkAmKU3A==",
        "Client-Secret": "Ya1G9KAmyQvz+8uvRkdjeMflrMwCrQ2zBhUPBoNUGc0=",
        Authorization: "Basic U3Jpa2FudGE6U01AMTIz",
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios(config)
      .then(function (response) {
        console.log(response.data)
        impsBankAccountModel.findOneAndUpdate({ UserId: req.body.UserId },
          {
            bankAccKey: response.data.bankAccountKey,
          },
          { new: true, upsert: true }
        ).then(resp=>{
          console.log(resp,"resp")
        })
        res.status(200).send({
          data: response.data,
          error: null,
          status: 1,
          message: "Success",
        });
      })
      .catch(function (error) {
        res.status(400).send({
          data: null,
          error: error,
          status: 0,
          message: "Error in Register",
        });
      });
    }else{
      res.status(200).send({
        status:0,
        message:"user not found"
      })
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in verifying IFSC code",
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
    if(find_user){
      const find_imps_details = await impsBankAccountModel.findOne({UserId:find_user._id}).lean()
    var config = {
      method: "post",
      url: `https://developer.fidypay.com/payout/v3/${find_imps_details.bankAccKey}/sendOtp/${req.body.amount}`,
      headers: {
        "Client-Id": "0Xv+UAnlOVQf6vFkAmKU3A==",
        "Client-Secret": "Ya1G9KAmyQvz+8uvRkdjeMflrMwCrQ2zBhUPBoNUGc0=",
        Authorization: "Basic U3Jpa2FudGE6U01AMTIz",
      },
    };

    axios(config)
      .then(function (response) {
        console.log(response.data)
        impsBankAccountModel.findOneAndUpdate({ UserId: req.body.UserId },
          {
            amount: req.body.amount,
            merchantTrxnRefId: response.data.merchantTrxnRefId,
          },
          { new: true, upsert: true }
        ).then(resp=>{
          console.log(resp,"resp")
        })
        res.status(200).send({
          data: response.data,
          error: null,
          status: 1,
          message: "Success",
        });
      })
      .catch(function (error) {
        res.status(400).send({
          data: null,
          error: error,
          status: 0,
          message: "Error in sending otp",
        });
      });
    }else{
      res.status(200).send({
        status:0,
        message:"user not found"
      })
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in sending otp",
    });
  }
};

exports.otpVerifycation = async (req, res) => {
  try {
    const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
    if(find_user){
      const find_imps_details = await impsBankAccountModel.findOne({UserId:find_user._id}).lean()
    var config = {
      method: "post",
      url: `https://developer.fidypay.com/payout/v3/${req.body.otp}/otpVerification/${find_imps_details.merchantTrxnRefId}`,
      headers: {
        "Client-Id": "0Xv+UAnlOVQf6vFkAmKU3A==",
        "Client-Secret": "Ya1G9KAmyQvz+8uvRkdjeMflrMwCrQ2zBhUPBoNUGc0=",
        Authorization: "Basic U3Jpa2FudGE6U01AMTIz",
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        res.status(200).send({
          data: response.data,
          error: null,
          status: 1,
          message: "Success",
        });
      })
      .catch(function (error) {
        res.status(400).send({
          data: null,
          error: error,
          status: 0,
          message: "Error in verifying otp",
        });
      });
    }else{
      res.status(200).send({
        status:0,
        message:"user not found"
      })
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in verifying otp",
    });
  }
};

exports.verifyIfscCode = async (req, res) => {
  try {
    let axiosConfig = {
      headers: {
        Authorization: "Basic U3Jpa2FudGE6U01AMTIz",
        "Content-Type": "application/json",
        "Client-Id": "0Xv+UAnlOVQf6vFkAmKU3A==",
        "Client-Secret": "Ya1G9KAmyQvz+8uvRkdjeMflrMwCrQ2zBhUPBoNUGc0=",
      },
    };
    axios
      .post(
        `https://developer.fidypay.com/payout/v3/verifyIfscCode/${req.body.ifsc}`,
        {},
        { headers: axiosConfig.headers }
      )
      .then(function (response) {
        res.status(200).send({
          data: response.data,
          error: null,
          status: 1,
          message: "Success",
        });
        console.log("fid Ifsc", response);
      })
      .catch(function (error) {
        res.status(400).send({
          data: null,
          error: error,
          status: 0,
          message: "Error in verifying IFSC code",
        });
        console.log("fid error", error);
      });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in verifying IFSC code",
    });
  }
};

exports.domesticPayment = async (req, res) => {
  try {
    const find_user = await userModel.findOne({_id:req.body.UserId}).lean()
    if(find_user){
      const find_imps_details = await impsBankAccountModel.findOne({UserId:find_user._id}).lean()
    var data = JSON.stringify({
      address: req.body.address,
      amount: find_imps_details.amount,
      bankaccountkey: find_imps_details.bankAccKey,
      beneficiaryAccNo: req.body.bankAccNo,
      beneficiaryIfscCode: req.body.bankIfscCode,
      beneficiaryName:find_user.fullname,
      emailAddress: find_user.email,
      merchantTrxnRefId: find_imps_details.merchantTrxnRefId,
      mobileNumber: find_user.mobileNumber,
      otp: req.body.otp,
      transferType: "IMPS",
      trxnNote: "Payout",
    });

    var config = {
      method: "post",
      url: "https://developer.fidypay.com/payout/v3/domesticPayment",
      headers: {
        "Client-Id": "0Xv+UAnlOVQf6vFkAmKU3A==",
        "Client-Secret": "Ya1G9KAmyQvz+8uvRkdjeMflrMwCrQ2zBhUPBoNUGc0=",
        Authorization: "Basic U3Jpa2FudGE6U01AMTIz",
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        const data = new impsDataModel(response.data)

        data.UserId =req.body.UserId
        data.save()
        
        console.log(response.data)
        res.status(200).send({
          data: response.data,
          error: null,
          status: 1,
          message: "Success",
        });
      })
      .catch(function (error) {
        res.status(400).send({
          data: null,
          error: error,
          status: 0,
          message: "Error in payment",
        });
      });
    }else{
      res.status(200).send({
        status:0,
        message:"user not found"
      })
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in payment",
    });
  }
};

exports.webhook = async(req, res)=>{
  try{

    console.log(req.body,"req.body")
    const schema = new fidypayWebhookModel()
    schema.description = req.body.description
    schema.merchantTrxnRefId = req.body.merchantTrxnRefId
    schema.trxn_id = req.body.trxn_id
    schema.code = req.body.code
    schema.transactionIdentification = req.body.transactionIdentification
    schema.status = req.body.status
    schema.creationDateTime = req.body.creationDateTime
    schema.instructionIdentification = req.body.instructionIdentification
    schema.amount = req.body.amount
    schema.debitAccNo = req.body.debitAccNo
    schema.beneficiaryAccNo = req.body.beneficiaryAccNo
    schema.beneficiaryIfscCode = req.body.beneficiaryIfscCode
    schema.beneficiaryName = req.body.beneficiaryName
    schema.address = req.body.address
    schema.country = req.body.country
    schema.utr = req.body.utr
    schema.save()
    res.status(200).send({
      data: schema,
      status :1,
      message: "webhook created"
    })

  }catch(error){
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in webhook",
    });
  }
}