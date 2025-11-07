const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: Number,
      default: null,
    },

    otpExpireAt: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordTokenExpireAt: {
      type: Date,
      dafault: Date.now,
    },

    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
