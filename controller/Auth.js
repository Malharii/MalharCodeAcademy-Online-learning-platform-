const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
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

exports.signUp = async (req, res) => {};
