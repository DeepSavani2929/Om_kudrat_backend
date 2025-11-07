const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/auth.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { mongoose } = require("mongoose");

const { EMAIL_USER, EMAIL_PASS } = process.env;


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const isUserExist = await User.findOne({ email: email });

    if (isUserExist) {
      return res
        .status(400)
        .json({ success: false, message: "registered user already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ success: true, message: "User registered Successfully!" });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message || error.defaultError });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginUser = await User.findOne({ email: email });

    if (!loginUser)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials!" });

    const isMatch = await bcrypt.compare(password, loginUser.password);

    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials!" });

    const token = jwt.sign(
      {
        id: loginUser._id,
        role: loginUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    const { password: pwd, ...userData } = loginUser._doc;

    return res
      .status(200)
      .cookie("accessToken", token, {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
      })
      .json({
        success: true,
        data: userData,
        token: token,
        role: loginUser.role,
        message: "User login successfully!",
      });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message || error.defaultError });
  }
};


const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: auth.userNotFound });
    }

    const comparePassword = await bcrypt.compare(oldPassword, user.password);

    if (!comparePassword) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "user entered password not matched with the original password",
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    return res
      .status(200)
      .json({ success: true, message: "User password changed successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || error.serverError });
  }
};


const emailVerify = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User with this email is not registered!" });
    }

  const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); 
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordTokenExpireAt = new Date(Date.now() + 60 * 60 * 1000); 

    const link = `http://localhost:5173/verifyOtp/${resetPasswordToken}/${user._id}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: user.email,
      subject: "Your OTP",
      html: `<div>
               <h1>Your Otp : ${otp}</h1>
               <a href="${link}">Verify Email</a>
             </div>`,
    };

    await transporter.sendMail(mailOptions);

    await User.findByIdAndUpdate(
      user._id,
      {
        otp,
        otpExpireAt,
        resetPasswordToken,
        resetPasswordTokenExpireAt,
      }
    );

    return res.status(200).json({
      success: true,
      data: { id: user._id, passwordToken: resetPasswordToken },
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const otpVerify = async (req, res) => {
  try {
    const { token, otp, id } = req.body;
    const userId = new mongoose.Types.ObjectId(id);
    const numOtp = parseInt(otp);
    console.log(typeof numOtp)

    const user = await User.findOne({
      _id: userId,
      resetPasswordToken: token,
      otp: numOtp,
      otpExpireAt: { $gt: Date.now() },
      resetPasswordTokenExpireAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Otp is Invalid" });
    }

    console.log(user)

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          otp: null,
          resetPasswordToken: "",
          otpExpireAt: null,
          resetPasswordTokenExpireAt: null,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: { id: user._id },
      message: "Otp Verified!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.serverError });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, id } = req.body;
      const userId = new mongoose.Types.ObjectId(id);
    console.log(req.body)
    const user = await User.find({_id: userId});
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not registered" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    return res
      .status(200)
      .json({ success: true, message: "User password changed Successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  emailVerify,
  otpVerify,
  resetPassword,
};
