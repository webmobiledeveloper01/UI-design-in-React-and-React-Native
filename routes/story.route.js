const express = require('express');
const router = express.Router();
const storyUpload = require("../middleware/upload_story");

const storyController = require("../controllers/story.controlller");

router.post("/create_story",storyUpload.single("image_url"),storyController.create_story);
router.get("/",storyController.getAll_story);
router.get("/:storyId",storyController.get_storyId);
router.delete("/:storyId",storyController.delete);

module.exports = router;