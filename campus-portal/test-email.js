require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');
console.log("Email:", process.env.SMTP_EMAIL);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.sendMail({
  from: process.env.SMTP_EMAIL,
  to: process.env.SMTP_EMAIL,
  subject: 'Test',
  text: 'Test'
}).then(() => console.log('Success')).catch(console.error);
