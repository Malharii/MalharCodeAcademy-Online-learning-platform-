const nodemailer = require("nodemailer");

const mailSender = async (email, titel, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    let info = await transporter.sendMail({
      from: "MalharCodeAcademy  - Malhar ", // sender address
      to: `${email}`, // list of receivers
      subject: `${titel}`, // Subject line

      html: `${body}`, // html body
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;
