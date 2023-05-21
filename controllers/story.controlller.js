const mongoose = require("mongoose")
const fs = require("fs");
const storyModel = require("../models/story.model");

exports.create_story = async(req,res)=> {
    try {
        console.log(req.body,"body")
        const story = req.body;
        if (req.file) {
            story.image_url = req.file.destination + req.file.filename
        }
        console.log(req.file,"file")
        const story_id = req.body.story_id && mongoose.isValidObjectId(req.body.story_id) 
            ? req.body.story_id : mongoose.Types.ObjectId();
        const storyCreate = await storyModel.findOneAndUpdate(
            {_id:story_id},story,{new:true,upsert:true}
        )

        res.status(200).send({
            data:storyCreate,
            error:null,
            status:1,
            message:"Created story Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in creating the story"
        })
    }
};

exports.getAll_story = async(req,res)=>{
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const story = await storyModel.find().lean().skip((pageNumber - 1) * pageSize).limit(pageSize).sort({ _id: -1 });
        const count = await storyModel.countDocuments();
        res.status(200).send({
            data:{story,count},
            error:null,
            status:1,
            message:"Gettting all story Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in gettting all story"
        })
    }
};

exports.get_storyId = async(req,res)=>{
    try {
        const story = await storyModel.findOne({_id:req.params.storyId}).lean();
        res.status(200).send({
            data:story,
            error:null,
            status:1,
            message:"Gettting story_id"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in gettting story_id"
        })
    }
};

exports.delete = async(req,res)=>{
    try {
        const story = await storyModel.findOneAndDelete({_id:req.params.storyId}).lean();
        if (story.image_url) {
            fs.unlink(story.image_url, (err) => {
                if (err) throw err;
            });
        }
        res.status(200).send({
            data:{story:story},
            error:null,
            status:1,
            message:"Deleting story"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in deleting story"
        })
    }
};