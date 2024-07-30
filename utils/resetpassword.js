const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendResetPasswordEmail = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Dear User,</p><p>Please click <a href="${resetLink}">here</a> to reset your password.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully');
  } catch (error) {
    console.error('Error sending reset password email:', error);
  }
};

const sendSuccessResetEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Success',
      html: `<p>Dear User,</p><p>Your password has been successfully reset.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset success email sent successfully');
  } catch (error) {
    console.error('Error sending password reset success email:', error);
  }
};

module.exports = { sendResetPasswordEmail, sendSuccessResetEmail };
