const nodemailer = require('nodemailer');

module.exports = (email, subject, message) => {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });

    let mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: subject,
      html: message
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if(err) {
        console.log(err);
        return ;
      }

      console.log('Message Sent: %s', info.messageId);

      console.log('Preview URL: %s', nodemailer.getTextMessageUrl(info));

    });
}
