const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();
// send OTp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const chekUserPresent = await User.findOne({ email });
    if (chekUserPresent) {
      return res.status(401).json({ success: false, message: "User already exist" });
    }

    // generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("opt generated successfully:", otp);

    // cheak unique otp or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = {
      email: email,
      otp: otp,
    };
    const otpBody = new OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({ success: true, message: "OTP send successfully", otp });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
};

//singUp

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !accountType ||
      !contactNumber ||
      !otp
    ) {
      return res.status(403).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword value does not match , please try again",
      });
    }

    // cheak user exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ success: false, message: "User already exist" });
    }

    // find most recent otp
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
    if (recentOtp.lenght == 0) {
      return res.status(401).json({ success: false, message: "OTP found" });
    } else if (otp != recentOtp.otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const additionalDetails = {
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    };

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      additionalDetails: additionalDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    res.status(200).json({ success: true, message: "User created successfully", user });

    //return res
    return res
      .status(200)
      .json({ success: true, message: "User created successfully", user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "user cannot be created , plz try again" });
  }
};

// login

exports.login = async (req, res) => {
  try {
    //get data from request body
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2hr",
      });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        user: user,
        token: token,
        message: "User logged in successfully",
      });
    } else {
      return res.status(401).json({ success: false, message: "password is incorrect" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Login failure, please try again" });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(403).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword do not match, please try again",
      });
    }

    const user = await User.findById(req.user.id);

    if (await bcrypt.compare(oldPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();

      // Send confirmation email after password change
      const emailBody = `<p>Hello ${user.firstName},</p>
                         <p>Your password has been successfully updated.</p>
                   
                         <p>Best regards,</p>
                         <p>MalharCodeAcademy</p>`;

      await mailSender(user.email, "Password Changed Successfully", emailBody);

      return res.status(200).json({
        success: true,
        message: "Password changed successfully, and a confirmation email has been sent.",
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Password could not be changed, please try again later.",
    });
  }
};
