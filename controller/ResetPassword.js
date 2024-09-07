const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bycrypt = require("bcrypt");

// reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Your email address not found" });
    }
    const token = crypto.randomUUID();

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );
    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(
      email,
      "password reset link -",
      `Click here to reset your password ${url}`
    );
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong while reset password" });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password and confirmPassword do not match, please try again",
      });
    }

    const userDetails = await User.findOne({ token: token });

    if (!userDetails) {
      return res.json({ success: false, message: "Invalid token" });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({ success: false, message: "Token expired, please try again" });
    }
    const hashedPassword = await bycrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong while reset password" });
  }
};
