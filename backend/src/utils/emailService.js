const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - OER Learning Companion",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your OER Learning Companion account.</p>
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
      <small>OER Learning Companion</small>
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
