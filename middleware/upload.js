const path = require("path");
const multer = require("multer");
const otpGenerator = require("otp-generator");
const transaction_id = otpGenerator.generate(4, {
  upperCaseAlphabets: false,
  specialChars: false,
  lowerCaseAlphabets: false,
});

var store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: async function (req, file, cb) {
    let ext = path.extname(file.originalname);
    let date = Date.now() - Math.floor(Math.random() * 100) + 1;
    console.log("random", Math.floor(Math.random() * 100) + 1, date);
    cb(null, date + ext);
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
      file.mimetype == "multipart/form-data"
    ) {
      callback(null, true);
    } else {
      console.log(file.mimetype, "only jpg, png, jfif or jpeg are allowed");
    }
  },
  // limits: {
  //   fileSize: 1024 * 1024 * 2,
  // },
});
module.exports = upload;
