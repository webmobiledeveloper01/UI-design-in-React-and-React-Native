const express = require('express');
const router = express.Router();

const media_linkController = require("../controllers/media_links.controller");

router.post("/media_linkCreate",media_linkController.media_linksCreate);

router.post("/media_linkUpdate",media_linkController.media_linksUpdate);

router.get("/",media_linkController.getAll);

router.get("/:media_linkId",media_linkController.getById);

router.delete("/:media_linkId",media_linkController.delete);

module.exports = router;