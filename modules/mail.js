const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
require("dotenv").config({ path: ".env" });

const sendEmail = (options) =>
  new Promise((resolve, reject) => {
    const transpoter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      secure: true,
      secureConnection: false, // TLS requires secureConnection to be false
      tls: {
        ciphers: "SSLv3",
      },
      requireTLS: true,
      port: 465,
      debug: true,
      auth: {
        user: "pearl@gogametoken.com",
        pass: "Cascablanca1744##*",
      },
    });
    const text = htmlToText.fromString(options.html, {
      wordwrap: 130,
    });
    const mailOptions = {
      from: "pearl@gogametoken.com",
      to: options.email,
      subject: options.subject,
      text,
      html: options.html,
    };
    transpoter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      console.log("Message id ", info.messageId);
      console.log("Preview URL ", nodemailer.getTestMessageUrl(info));
      return resolve({ message: "Reset Email has sent to your inbox" });
    });
  });

module.exports = sendEmail;
