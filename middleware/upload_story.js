const path = require("path");
const  multer = require("multer");

var store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "story/");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

var upload = multer({
  storage: store,
  fileFilter: function (req, file, callback) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "application/octet-stream" ||
      file.mimetype == 'multipart/form-data')
     {
      callback(null, true);
    } else {
      console.log("only jpg, png or jpeg are allowed",file.mimetype);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});
module.exports = upload;