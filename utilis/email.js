const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      username: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Artur Rudnicki <8arturrudnicki@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendEmail(mailOptions);
};

module.exports = sendEmail;
