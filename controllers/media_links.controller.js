const mongoose = require("mongoose");
const media_linksModel = require("../models/media_links.model");

exports.media_linksCreate = async (req, res) => {
  try {
    const schema = new media_linksModel(req.body);
    const media_links = await media_linksModel.create(schema);
    res.status(200).send({
      data: media_links,
      error: null,
      status: 1,
      message: "Created media links successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in creating media_links",
    });
  }
};

exports.media_linksUpdate = async (req, res) => {
    try {
        const schema = req.body;
        const media_links = await media_linksModel.findOneAndUpdate({_id:req.body.media_linkId},schema,{new:true});
        res.status(200).send({
            data:media_links,
            error:null,
            status:1,
            message:"Updated media links Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error in updating media_links",
        });
    }
};

exports.getAll = async(req,res)=>{
    try {
       
        const media_links = await media_linksModel.find().lean()
        res.status(200).send({
            data:media_links,
            error:null,
            status:1,
            message:"Getting media links data successfully"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error in getting media_links",
        });
    }
};

exports.getById = async(req,res)=>{
    try {
        const media_link = await media_linksModel.findOne({_id:req.params.media_linkId});
        res.status(200).send({
            data:media_link,
            error:null,
            status:1,
            message:"Getting Media link data"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error in getting media_link data",
        });
    }
};

exports.delete = async(req,res)=>{
    try {
        const media_link = await media_linksModel.findOneAndDelete({_id:req.params.media_linkId});
        res.status(200).send({
            data:media_link,
            error:null,
            status:1,
            message:"Deleted media link data successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in deleting media links"
        })
    }
}
