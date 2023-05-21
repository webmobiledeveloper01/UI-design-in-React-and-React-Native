const digioModel = require("../models/digio.model")
const userModel = require("../models/user.model")
const  axios = require("axios");

module.exports = {

    async addsuccessid(req,res,next){
        try{
            const find_user = await userModel.findOne({_id:req.body.UserId})
            if(find_user){
                if(find_user.kycVerified == 'e' || find_user.kycVerified == 'r'){
                  const find_sId = await digioModel.findOne({UserId:find_user._id})
                    if(find_sId){
                      const delete_sId = await digioModel.findOneAndDelete({_id:find_sId._id})
                      console.log(delete_sId,"delete")
                    }
                    const update_user = await userModel.findOneAndUpdate({_id:req.body.UserId},{
                        kycVerified : 'p'
                    },{new:true})
                    console.log(update_user,'update_user')
                    const digio = new digioModel()
                    digio.UserId = req.body.UserId;
                    digio.successId = req.body.successid;
                    const add_digio = await digioModel.create(digio);
                    if(add_digio){
                        res.status(200).send({
                            data:add_digio,
                            message:"successId saved",
                            status:1,
                            error:null
                        })
                    }else{
                        res.status(200).send({
                            data:null,
                            message:"successId not saved",
                            status:0
                        })
                    }
                }else
                if(find_user.kycVerified == 'p'){
                    res.status(200).send({ 
                        status: 0,
                        message: 'Your kyc in pending mode' 
                    });
                }else{
                    res.status(200).send({ 
                        status: 0, 
                        message: 'Your kyc already done' 
                    });
                }
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
                message:"Error in add successId",
                status:0
            })
        }
    },

    async webhookdigio(req,res,next){
        try{
            if(req.body){
                if(req.body.event === 'kyc.request.approved'){
                    digioModel.findOne({'successId' : req.body.payload.kyc_request.id , 'status' : 0 }).exec(async(err,result)=>{
                        if (err)  return res.status(200).send({ 'status': 1, 'message': 'error' });
                        if(result){
                           
                            if(req.body.payload.kyc_request.status === 'approved'){
                                console.log('approved');
                                const u = await userModel.findById({ _id: result.UserId }).exec();
                                if (u){
                                    result.status = 1;
                                 
                                    result.save();
                                    u.kycVerified = 'v';
                                    u.firstEntryAllowed = true;
                                    u.newuser = false;
                                    u.save();
                                    
                                    // if(u.deviceToken){
                                    //     notification.dummynotification(u.deviceToken, {'screen' : 'profile'} ,'GoGame','Your KYC is Approved')
                                    // }
                                    return res.status(200).send({ 'status': 1, 'message': 'save success' });
                                }else {
                                    return res.status(200).send({ 'status': 1, 'message': 'user no found' });
                                }
                            }else {
                                return res.status(200).send({ 'status': 1, 'message': 'not approved' });
                            }
                         }else {
                            return res.status(200).send({ 'status': 1, 'message': 'no data found' });
                         }
                    })
                }else if( req.body.event === 'kyc.request.rejected'){
                    digioModel.findOne({'successId' : req.body.payload.kyc_request.id , 'status' : 0 }).exec(async(err,result)=>{
                        console.log('err',err,'result',result);
                        if (err)  return res.status(200).send({ 'status': 1, 'message': 'error' });
                        if(result){
                            console.log('resulte demo');
                            if(req.body.payload.kyc_request.status === 'rejected'){
                                console.log('rejected');
                                const u = await userModel.findById({ _id: result.UserId }).exec();
                                if (u){
                                    console.log('rejected use');
                                    result.status = 1;
                                    result.save();
                                    u.kycVerified = 'r';
                                    u.save();
                                    
                                    // if(u.deviceToken){
                                    //     notification.dummynotification(u.deviceToken, {'screen' : 'profile'} ,'GoGame','Your KYC is Rejected' )
                                    // }
                                    return res.status(200).send({ 'status': 1, 'message': 'save success' });
                                }else {
                                    return res.status(200).send({ 'status': 1, 'message': 'user no found' });
                                }
                            }else {
                                return res.status(200).send({ 'status': 1, 'message': 'not approved' });
                            }
                         }else {
                            return res.status(200).send({ 'status': 1, 'message': 'no data found' });
                         }
                        })
                } else {
                    return res.status(200).send({ 'status': 1, 'message': 'request not approved ' });
                }
            }else {
                return res.status(200).send({ 'status': 1, 'message': 'body not found' });
            }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"Error in digio webhook",
                status:0
            })
        }
    },

    async add_successId(req,res,next){
        try{
            const find_user  = await userModel.findOne({_id:req.body.UserId})
            if(find_user){
            const create_kId = await axios.post('https://api.digio.in/client/kyc/v2/request/with_template',{
                customer_identifier: find_user.email, 
                customer_name: find_user.username, 
                reference_id: "CRN122306114425315NN", 
                template_name: "KYC UPLOAD VERIFICATION",
                notify_customer: true, 
                request_details: {
                },
                transaction_id: "CRN122306114425315NN",
                generate_access_token: false
            },{headers:{'authorization':'Basic QUlOSFpITk9UTzdWQ0JLVFhSQ0lYVURQV0VPWUM0MlY6S0Q1U0ExTUVTRjlYTDhFN01QSktXOUxUOUk3S0hFVko='}})
            console.log(create_kId,"data11")
            const schema = new digioModel()
            schema.UserId = find_user._id
            schema.successId =create_kId.data.id 
            const create_kid = await digioModel.create(schema);
            res.send({
              data:create_kId.data,
              message:"kId created",
              status:1,
              error:null
            })
        }else{
            res.status(200).send({
                data:null,
                message: " User Not Found",
                status:0
            })
        }
        }
        catch(error){
            res.status(400).send({
                error:error,
                message:"Error in Add successId in digio",
                status:0
            })
        }
      },
    
      async get_status(req,res,next){
        try{
          const find_user = await userModel.findOne({_id:req.body.UserId})
          if(find_user){
            if(find_user.kycVerified == 'v'){
              res.status(200).send({
                data:find_user,
                message:"user data",
                status:1
              })
            }
            else{
              const get_kId = await digioModel.findOne({UserId:find_user._id})
              if(get_kId){
              const check_status = await axios.post(`https://api.digio.in/client/kyc/v2/${get_kId.successId}/response`,{},{headers:{'authorization':'Basic QUlOSFpITk9UTzdWQ0JLVFhSQ0lYVURQV0VPWUM0MlY6S0Q1U0ExTUVTRjlYTDhFN01QSktXOUxUOUk3S0hFVko='}})
              console.log(check_status)
              // res.status(200).send(check_status.data);
              if(check_status.data.status == 'requested'){
                const update_user= await userModel.findOneAndUpdate({_id:find_user._id},{
                  kycVerified : 'p',
                },{new:true})
                res.status(200).send({
                  data:update_user,
                  message:"User data",
                  status:1,
                  error:null
                })
              }else if(check_status.data.status == 'approval_pending'){
                const update_user= await userModel.findOneAndUpdate({_id:find_user._id},{
                  kycVerified : 'p',
                },{new:true})
                res.status(200).send({
                  data:update_user,
                  message:"User data",
                  status:1,
                  error:null
                })
              }else if(check_status.data.status == 'rejected'){
                const update_user= await userModel.findOneAndUpdate({_id:find_user._id},{
                  kycVerified : 'r',
                },{new:true})
                res.status(200).send({
                  data:update_user,
                  message:"User data",
                  status:1,
                  error:null
                })
              }else if(check_status.data.status == 'approved'){
                const update_user= await userModel.findOneAndUpdate({_id:find_user._id},{
                  kycVerified : 'v',
                },{new:true})
                res.status(200).send({
                  data:update_user,
                  message:"User data",
                  status:1,
                  error:null
                })
              }
              }else{
                res.status(200).send({
                  data:"null",
                  message:"upload document for kyc",
                  status:0
                })
              }
    
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
            message:"error in get kyc status",
            status:0
          })
        }
      }
}