const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    otp: {
      // this will be sent to the user
      type: String,
      required: true,
    },
    otpToken: {
      // this will be sent to the front-end
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      res: "users",
      required: true,
    },
    purpose: {
      type: String,
      enum: ["verify-email", "reset-password"],
      required: true,
    },
  },
  { timestamps: true }
);
// the user have to provide the otp token and the otp in order to be verified

const otpModel = mongoose.model("otps", schema);

module.exports = otpModel;
