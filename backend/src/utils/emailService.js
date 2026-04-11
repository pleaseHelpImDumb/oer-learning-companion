const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Request - Motivational Learning Companion",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your MLC account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      ">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p><strong>This link expires in 30 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <small>Motivational Learning Companion></small>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendPasswordResetEmail };
